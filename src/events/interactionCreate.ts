import { Client, CommandInteraction, EmbedBuilder, Events } from "discord.js";
import { commands } from "../commands";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
      await handleCommand(client, interaction);
    }
  });
};

const handleCommand = async (
  client: Client,
  interaction: CommandInteraction,
): Promise<void> => {
  const command = commands.find((c) => c.name === interaction.commandName);
  if (!command) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("Error, command could not be found")
          .setColor("Red"),
      ],
      flags: 64,
    });
    return;
  }

  try {
    command.run(client, interaction as any);
  } catch (error) {
    console.error("Error handling command", error);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("There was an error while executing this command")
          .setColor("Red"),
      ],
      flags: 64,
    });
  }
};
