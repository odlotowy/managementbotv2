import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { command } from "../../types";
import { Manager } from "../../models/Manager";

export const leaderboard: command = {
  name: "leaderboard",
  description: "Shows the leaderboard of the top active managers",
  options: [
    {
      name: "category",
      description: "Select leaderboard category (default is all-in-one)",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "All-In-One (Shifts + Tickets)",
          value: "total",
        },
        {
          name: "Only Shifts",
          value: "shifts",
        },
        {
          name: "Only Tickets",
          value: "tickets",
        },
      ],
      required: false,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;
    const { options } = interaction;

    const category = options.getString("category") || "total";

    await interaction.deferReply();

    // get all the managers from the database
    const managers = await Manager.find({});

    if (!managers || managers.length === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "<:redtick:1524401212915716227> No managers found in the database",
            )
            .setColor("Red"),
        ],
      });
    }

    // filter the categories
    if (category == "shifts") {
      managers.sort(
        (a, b) => (b.stats?.loggedShifts ?? 0) - (a.stats?.loggedShifts ?? 0),
      );
    } else if (category == "tickets") {
      managers.sort(
        (a, b) => (b.stats?.tickets ?? 0) - (a.stats?.tickets ?? 0),
      );
    } else {
      managers.sort(
        (a, b) =>
          (b.stats?.loggedShifts ?? 0) +
          (b.stats?.tickets ?? 0) -
          ((a.stats?.loggedShifts ?? 0) + (a.stats?.tickets ?? 0)),
      );
    }

    // Select TOP 10 managers
    const top10 = managers.slice(0, 10);

    // Map the results onto a list
    const leaderboardLines = top10.map((manager, index) => {
      let medal = `\`#${index + 1}\``;
      if (index === 0) medal = "🥇";
      if (index === 1) medal = "🥈";
      if (index === 2) medal = "🥉";

      let scoreDetails = "";
      if (category == "shifts") {
        scoreDetails = `**${manager.stats?.loggedShifts}** shifts`;
      } else if (category == "tickets") {
        scoreDetails = `**${manager.stats?.tickets}** tickets`;
      } else {
        const total =
          (manager.stats?.loggedShifts ?? 0) + (manager.stats?.tickets ?? 0);
        scoreDetails = `**${total}** points _(${manager.stats?.loggedShifts}S / ${manager.stats?.tickets}T)_`;
      }

      return `${medal} <@${manager.discordId}> (\`${manager.roblox?.username}\`) - ${scoreDetails}`;
    });

    let title = "Activity Leaderboard - All-In-One";
    if (category === "shifts") title = "Activity Leaderboard - Shifts";
    if (category === "tickets") title = "Activity Leaderboard - Tickets";

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(0x0a5e0c)
      .setDescription(leaderboardLines.join("\n") || "No activity this week.")
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
