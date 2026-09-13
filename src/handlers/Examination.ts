import { Client, EmbedBuilder, Events } from "discord.js";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "exam_start") {
      await interaction.reply({
        content: "https://forms.gle/qRbe6X8JEYykQ2cu9",
        flags: 64,
      });

      const embed = new EmbedBuilder()
        .setDescription("Examination Started")
        .setFields(
          {
            name: "User",
            value: `${interaction.user} \`${interaction.user.id}\``,
            inline: true,
          },
          {
            name: "Time started",
            value: `<t:${Math.floor(Date.now() / 1000)}:T>`,
            inline: true,
          },
        )
        .setColor("DarkGreen");

      const channel = interaction.guild?.channels.cache.get(
        "1532374206648680488",
      );
      if (!channel || !channel.isSendable()) return;

      await channel.send({
        embeds: [embed],
        content: `<@&1523408377743671427>`,
      });
    }
  });
};
