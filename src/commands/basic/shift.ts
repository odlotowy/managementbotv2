import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { command } from "../../types";
import { Manager } from "../../models/Manager";

export const shift: command = {
  name: "shift",
  description: "Log a shift",
  options: [
    {
      name: "shift_log_url",
      description: "Paste the URL of the shift log",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;

    await interaction.deferReply();
    const log_url = interaction.options.getString("shift_log_url");
    const shiftLogsChannelId = "1523375390893281521";
    const logsChannel =
      interaction.guild.channels.cache.get(shiftLogsChannelId);
    if (!logsChannel || !logsChannel.isSendable()) return;

    const managerData = await Manager.findOneAndUpdate(
      { discordId: interaction.user.id },
      { $inc: { "stats.loggedShifts": 1 } },
      { new: true },
    );

    if (!managerData) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "<:redtick:1524401212915716227> User not found in the database",
            )
            .setColor("Red"),
        ],
      });
    }
    if (!managerData.stats || !managerData.roblox) return;

    const quotaStatus =
      managerData.stats.loggedShifts >= 2
        ? "<:tick:1524401085920579764> Shift Quota Completed"
        : "<:redtick:1524401212915716227> Shift Quota Not Completed";

    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${managerData.roblox?.username} | ${managerData.roblox?.rankgroup}`,
        iconURL: `${managerData.roblox?.avatar || interaction.user.displayAvatarURL()}`,
      })
      .setTitle("New Shift Logged")
      .addFields(
        {
          name: "Shifts logged this week",
          value: `\`${managerData.stats.loggedShifts}\``,
          inline: true,
        },
        {
          name: "Message URL",
          value: `${log_url}`,
          inline: true,
        },
      )
      .setColor(0x0a5e0c)
      .setTimestamp();

    await logsChannel.send({ embeds: [logEmbed] });

    const embed = new EmbedBuilder()
      .setTitle("Shift Logged Successfully")
      .setColor(0x2ecc71) // Zielony kolor sukcesu
      .setDescription(
        `Good job, ${interaction.user}! Your shift has been logged successfully.`,
      )
      .addFields(
        {
          name: "Your shifts this week",
          value: `\`${managerData.stats.loggedShifts}\` / 2`,
          inline: true,
        },
        { name: "Status", value: `**${quotaStatus}**`, inline: true },
      )
      .setThumbnail(
        managerData.roblox.avatar || interaction.user.displayAvatarURL(),
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
