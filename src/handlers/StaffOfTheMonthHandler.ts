import { Client, EmbedBuilder, Events } from "discord.js";
import { GetUserRank } from "../utils/GetUserRank";
import { Manager } from "../models/Manager";

const channel_id = "1523375442596200539";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("sotm_request:")
    ) {
      const rblx_username = interaction.fields.getTextInputValue("roblox_sotm");
      const discord_username =
        interaction.fields.getTextInputValue("discord_sotm");
      const reason = interaction.fields.getTextInputValue("reason_sotm");

      const robloxUser = await GetUserRank(rblx_username);
      if (!robloxUser) return;

      const managerData = await Manager.findOneAndUpdate(
        { discordId: interaction.user.id },
        { $inc: { "stats.staffOfTheMonthRequests": 1 } },
        { new: true },
      );

      if (!managerData) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "<:redtick:1524401212915716227> You don't have required permissions to execute this command. Please verify your account first.",
              )
              .setColor("Red"),
          ],
        });
      }
      if (!managerData.stats || !managerData.roblox) return;

      if (!robloxUser.inGroup) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "<:redtick:1524401212915716227> The user you want to nominate for the SOTM award, is not in the roblox group.",
              )
              .setColor("Red"),
          ],
          flags: 64,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("SOTM Request Submitted Successfully")
        .setDescription(
          `Good job, ${interaction.user}! Your SOTM request has been submitted successfully!`,
        )
        .setThumbnail(
          `${managerData.roblox?.avatar || interaction.user.displayAvatarURL()}`,
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      const channel = interaction.guild?.channels.cache.get(channel_id);
      if (!channel || !channel.isSendable()) return;

      const logEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${managerData.roblox.username} | ${managerData.roblox?.rankgroup}`,
          iconURL: `${managerData.roblox.avatar}`,
        })
        .setTitle("Staff of the Month Request")
        .addFields(
          {
            name: "Roblox Username",
            value: `${rblx_username}`,
            inline: true,
          },
          {
            name: "Discord Username",
            value: `${discord_username}`,
            inline: true,
          },
          {
            name: "Rank In-Group",
            value: `${robloxUser.rankName}`,
            inline: true,
          },
          {
            name: "Justification",
            value: `${reason}`,
            inline: false,
          },
        )
        .setColor(0x0a5e0c)
        .setTimestamp();

      const msg = await channel.send({ embeds: [logEmbed] });

      const thread = await msg.startThread({
        name: `${robloxUser.username} - Staff of the Month`,
        autoArchiveDuration: 1440,
      });

      await msg.react("<:tick:1524401085920579764>").catch(() => {});
      await msg.react("🟡").catch(() => {});
      await msg.react("<:redtick:1524401212915716227>").catch(() => {});

      await thread.send(
        `${interaction.user} Greetings! Please send proof for this SOTM Request in this thread. Thank you!`,
      );
    }
  });
};
