import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { command } from "../../types";
import { Manager } from "../../models/Manager";

// ============================================================
// CONFIG
// ============================================================
const MOTW_ROLE_ID = "1523402939534672082";
const MOTM_ROLE_ID = "1523402854315065516";
const ANNOUNCEMENT_CHANNEL_ID = "1523370402657861672";
// ============================================================

interface ManagerDoc {
  _id: any;
  discordId: string;
  roblox: {
    userId: string;
    username: string;
    avatar: string;
    rankgroup: string;
    rankgroupid: number;
  };
  stats: {
    loggedShifts: number;
    tickets: number;
    staffOfTheMonthRequests: number;
  };
  activity: {
    streak: number;
    strikes: number;
    isMOTW: boolean;
    isMOTM: boolean;
    motwCount: number;
  };
}

export const activitycheck: command = {
  name: "activity-check",
  description: "Run an activity check on all managers.",
  options: [
    {
      name: "check_motm",
      description: "Also evaluate Management of the Month",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.inGuild()) return;

    const checkMotm = interaction.options.getBoolean("check_motm") ?? false;
    await interaction.deferReply();

    const managers = (await Manager.find({})) as unknown as ManagerDoc[];

    if (!managers.length) {
      await interaction.editReply("No managers found in the database.");
      return;
    }

    // --- Ranking helpers ---
    const score = (m: ManagerDoc) => m.stats.loggedShifts + m.stats.tickets;

    const rankedForMotw = [...managers].sort((a, b) => score(b) - score(a));
    const motwWinner =
      rankedForMotw.find((m) => !m.activity.isMOTW) ?? rankedForMotw[0];

    let motmWinner: ManagerDoc | undefined;
    if (checkMotm) {
      const rankedForMotm = [...managers].sort(
        (a, b) => b.activity.motwCount - a.activity.motwCount,
      );
      motmWinner =
        rankedForMotm.find((m) => !m.activity.isMOTM) ?? rankedForMotm[0];
    }

    const quotaCompleted = (m: ManagerDoc) =>
      m.stats.loggedShifts >= 2 &&
      m.stats.tickets >= 1 &&
      (checkMotm ? m.stats.staffOfTheMonthRequests >= 1 : true);

    // --- Build embed (Discord caps embeds at 25 fields) ---
    const embed = new EmbedBuilder()
      .setTitle(
        checkMotm
          ? "📊 Activity Check — MOTW & MOTM"
          : "📊 Activity Check — MOTW",
      )
      .setColor(0x2b2d31)
      .setTimestamp();

    for (const m of rankedForMotw) {
      const lines = [
        `Tickets: **${m.stats.tickets}**`,
        `Shifts: **${m.stats.loggedShifts}**`,
      ];
      if (checkMotm) {
        lines.push(`SOTM Requests: **${m.stats.staffOfTheMonthRequests}**`);
      }
      lines.push(
        `Quota: ${quotaCompleted(m) ? "✅ Completed" : "❌ Not completed"}`,
      );

      if (motwWinner && m._id.equals(motwWinner._id)) {
        lines.push("🏆 **Management of the Week**");
      }
      if (checkMotm && motmWinner && m._id.equals(motmWinner._id)) {
        lines.push("👑 **Management of the Month**");
      }

      embed.addFields({
        name: m.roblox.username,
        value: lines.join("\n"),
        inline: true,
      });
    }

    const confirmButton = new ButtonBuilder()
      .setCustomId("activity-check-confirm")
      .setLabel("Confirm & Clear Database")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      confirmButton,
    );

    const replyMessage = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    const collector = replyMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minutes to confirm
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId !== "activity-check-confirm") return;

      if (
        !buttonInteraction.memberPermissions?.has(
          PermissionFlagsBits.Administrator,
        )
      ) {
        await buttonInteraction.reply({
          content: "You need Administrator permission to confirm this.",
          ephemeral: true,
        });
        return;
      }

      await buttonInteraction.deferUpdate();
      collector.stop("confirmed");

      // Re-fetch in case anything shifted since the command ran
      const freshMotwWinner = motwWinner
        ? await Manager.findById(motwWinner._id)
        : null;
      const freshMotmWinner = motmWinner
        ? await Manager.findById(motmWinner._id)
        : null;

      // --- MOTW: clear old holder(s), set new winner, bump their monthly count ---
      await Manager.updateMany(
        { "activity.isMOTW": true },
        { $set: { "activity.isMOTW": false } },
      );
      if (freshMotwWinner) {
        await Manager.updateOne(
          { _id: freshMotwWinner._id },
          {
            $set: { "activity.isMOTW": true },
            $inc: { "activity.motwCount": 1 },
          },
        );
      }

      // --- MOTM: clear old holder(s), set new winner, reset monthly MOTW counters ---
      if (checkMotm && freshMotmWinner) {
        await Manager.updateMany(
          { "activity.isMOTM": true },
          { $set: { "activity.isMOTM": false } },
        );
        await Manager.updateOne(
          { _id: freshMotmWinner._id },
          { $set: { "activity.isMOTM": true } },
        );
        await Manager.updateMany({}, { $set: { "activity.motwCount": 0 } });
      }

      // --- Clear stats for everyone ---
      const resetFields: Record<string, number> = {
        "stats.loggedShifts": 0,
        "stats.tickets": 0,
      };
      if (checkMotm) resetFields["stats.staffOfTheMonthRequests"] = 0;
      await Manager.updateMany({}, { $set: resetFields });

      // --- Discord roles ---
      const guild = buttonInteraction.guild!;
      try {
        await guild.members.fetch(); // ensure role member caches are populated

        const motwRole = guild.roles.cache.get(MOTW_ROLE_ID);
        if (motwRole) {
          for (const [, member] of motwRole.members) {
            await member.roles.remove(MOTW_ROLE_ID).catch(() => null);
          }
        }
        if (freshMotwWinner) {
          const winnerMember = await guild.members
            .fetch(freshMotwWinner.discordId)
            .catch(() => null);
          if (winnerMember)
            await winnerMember.roles.add(MOTW_ROLE_ID).catch(() => null);
        }

        if (checkMotm && freshMotmWinner) {
          const motmRole = guild.roles.cache.get(MOTM_ROLE_ID);
          if (motmRole) {
            for (const [, member] of motmRole.members) {
              await member.roles.remove(MOTM_ROLE_ID).catch(() => null);
            }
          }
          const motmMember = await guild.members
            .fetch(freshMotmWinner.discordId)
            .catch(() => null);
          if (motmMember)
            await motmMember.roles.add(MOTM_ROLE_ID).catch(() => null);
        }
      } catch (err) {
        console.error("Role assignment error:", err);
      }

      // --- Announcement ---
      const channel = await guild.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);

      if (!channel?.isTextBased()) return;

      if (!freshMotwWinner || !freshMotwWinner.roblox) return;

      if (checkMotm && (!freshMotmWinner || !freshMotmWinner.roblox)) return;

      const announceEmbed = new EmbedBuilder()
        .setTitle("📢 Activity Check Results")
        .setColor(0xf1c40f)
        .setTimestamp();

      if (freshMotwWinner?.roblox) {
        announceEmbed.addFields({
          name: "🏆 Management of the Week",
          value: `<@${freshMotwWinner.discordId}> (${freshMotwWinner.roblox.username})`,
        });
      }

      if (checkMotm && freshMotmWinner?.roblox) {
        announceEmbed.addFields({
          name: "👑 Management of the Month",
          value: `<@${freshMotmWinner.discordId}> (${freshMotwWinner.roblox.username})`,
        });
      }

      await channel.send({ embeds: [announceEmbed] });

      // --- Disable the button so it can't be clicked twice ---
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ButtonBuilder.from(confirmButton)
          .setDisabled(true)
          .setLabel("Cleared ✅"),
      );
      await interaction.editReply({ components: [disabledRow] });

      await buttonInteraction.followUp({
        content: "Database cleared and roles updated.",
        ephemeral: true,
      });
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "confirmed") return;
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ButtonBuilder.from(confirmButton).setDisabled(true).setLabel("Expired"),
      );
      await interaction
        .editReply({ components: [disabledRow] })
        .catch(() => null);
    });
  },
};
