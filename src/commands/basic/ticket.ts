import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { command } from "../../types";
import { Manager } from "../../models/Manager";

export const ticket: command = {
  name: "ticket",
  description: "Log a ticket",
  options: [
    {
      name: "ticket_log_url",
      description: "Paste the URL of the ticket log",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;

    await interaction.deferReply();
    const log_url = interaction.options.getString("ticket_log_url");
    const shiftLogsChannelId = "1523375410115776633";
    const logsChannel =
      interaction.guild.channels.cache.get(shiftLogsChannelId);
    if (!logsChannel || !logsChannel.isSendable()) return;

    const managerData = await Manager.findOneAndUpdate(
      { discordId: interaction.user.id },
      { $inc: { "stats.tickets": 1 } },
      { new: true },
    );

    console.log("Aktualne statystyki z bazy:", managerData?.stats);

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
      managerData.stats.tickets >= 1
        ? "<:tick:1524401085920579764> Ticket Quota Completed"
        : "<:redtick:1524401212915716227> Ticket Quota Not Completed";

    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${managerData.roblox?.username} | ${managerData.roblox?.rankgroup}`,
        iconURL: `${managerData.roblox?.avatar || interaction.user.displayAvatarURL()}`,
      })
      .setTitle("New Ticket Logged")
      .addFields(
        {
          name: "Tickets logged this week",
          value: `\`${managerData.stats.tickets}\``,
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
      .setTitle("Ticket Logged Successfully")
      .setColor(0x2ecc71) // Zielony kolor sukcesu
      .setDescription(
        `Good job, ${interaction.user}! Your ticket has been logged successfully.`,
      )
      .addFields(
        {
          name: "Your tickets this week",
          value: `\`${managerData.stats.tickets}\` / 1`,
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
