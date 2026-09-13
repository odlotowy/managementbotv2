import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SeparatorBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { command } from "src/types";

export const verfication: command = {
  name: "verification",
  description: "Sends the verification embed",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;
    if (!interaction.channel || !interaction.channel.isSendable()) return;

    const container2 = new ContainerBuilder();

    const text = new TextDisplayBuilder().setContent(
      "## Management Server Verification\nWe're excited to welcome you to the Management Team. To continue with your internship program, please verify yourself using the button below.\n\nYou will need to provide:\n- Roblox Username\n- Discord Username\n- Who invited you to the server\n- Proof of invitation\n\n",
    );

    container2.addTextDisplayComponents(text);

    const verifyText = new TextDisplayBuilder().setContent(
      "To begin the verification process, please click the button below.",
    );

    container2.addTextDisplayComponents(verifyText);

    const separator = new SeparatorBuilder();

    container2.addSeparatorComponents(separator);

    const text2 = new TextDisplayBuilder().setContent(
      "-# Your request will be processed by the Management Leadership Team",
    );

    container2.addTextDisplayComponents(text2);

    const verifyButton = new ButtonBuilder()
      .setLabel("Begin The Verification Process")
      .setStyle(ButtonStyle.Success)
      .setCustomId("verify_begin");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      verifyButton,
    );

    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container2, row],
    });

    await interaction.reply({
      content: "Verification embed sent successfully!",
      flags: 64,
    });
  },
};
