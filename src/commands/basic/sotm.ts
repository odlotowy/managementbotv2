import {
  ChatInputCommandInteraction,
  Client,
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { command } from "../../types";

export const sotm: command = {
  name: "sotm-request",
  description: "Create a SOTM request",
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder()
      .setTitle("SOTM Request")
      .setCustomId(`sotm_request:${interaction.user.id}`);

    const roblox = new LabelBuilder()
      .setLabel("Roblox Username")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("roblox_sotm")
          .setStyle(TextInputStyle.Short),
      );

    const discord = new LabelBuilder()
      .setLabel("Discord Username")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("discord_sotm")
          .setStyle(TextInputStyle.Short),
      );

    const reason = new LabelBuilder()
      .setLabel("Justification")
      .setDescription(
        "Why do you believe they deserve a Staff of the Month award?",
      )
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("reason_sotm")
          .setStyle(TextInputStyle.Paragraph),
      );

    modal.addLabelComponents(roblox, discord, reason);

    await interaction.showModal(modal);
  },
};
