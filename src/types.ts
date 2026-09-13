import {
  ApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

export type configFile = {
  token: string;
  mongo_uri: string;
  ManagementLeadershipRoleId: string;
};

export type AnyCommandInteraction =
  | ChatInputCommandInteraction
  | UserContextMenuCommandInteraction
  | MessageContextMenuCommandInteraction;

export type command = ApplicationCommandData & {
  category?: string;
  run: (client: Client, interaction: any) => void;
};
