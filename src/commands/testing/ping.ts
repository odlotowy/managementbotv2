import {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
} from "discord.js";
import { command } from "src/types";

export const ping: command = {
  name: "ping",
  description: "Ping command",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Pong!");
  },
};
