import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { command } from "../../types";
import { Manager } from "../../models/Manager";

export const profile: command = {
  name: "profile",
  description: "Shows manager's profile and his statistics",
  options: [
    {
      name: "user",
      description:
        "Select the manager whose profile you want to view (leave blank if you want to view your profile)",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    const managerData = await Manager.findOne({ discordId: targetUser.id });
    if (!managerData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "<:redtick:1524401212915716227> User not found in the database",
            )
            .setColor("Red"),
        ],
        flags: 64,
      });
    }
    if (!managerData.activity) return;

    const profileEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${managerData.roblox?.username} | ${managerData.roblox?.rankgroup}`,
        iconURL: `${managerData.roblox?.avatar || targetUser.displayAvatarURL()}`,
      })
      .setTitle("Manager Profile")
      .setColor(0x0a5e0c)
      .addFields(
        {
          name: "Current Week Statistics",
          inline: true,
          value: `> **Logged Shifts:** \`${managerData.stats?.loggedShifts}\`\n> **Logged Tickets:** \`${managerData.stats?.tickets}\``,
        },
        {
          name: "Current Month Statistics",
          value: `> **SOTM Requests:** \`${managerData.stats?.staffOfTheMonthRequests}\``,
          inline: true,
        },
        {
          name: "Activity Statistics",
          value: `> **Activity Streak:** \`${managerData.activity.streak}\`\n> **Activity Strikes:** \`${managerData.activity.strikes}/3\``,
          inline: true,
        },
      )
      .setTimestamp();

    return interaction.reply({ embeds: [profileEmbed] });
  },
};
