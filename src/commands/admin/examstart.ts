import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { command } from "../../types";

export const examstart: command = {
  name: "exam-start",
  description: "Send a examination start embed",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel || !interaction.channel.isSendable()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            "<:cross1:1525789345376768020> This channel does not allow for sending messages. If you believe it's a mistake, please contact a bot administrator.",
          ),
        ],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Begin the Examination")
      .setDescription(
        "Start your management examination by clicking the button below.",
      )
      .setColor("Grey");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("exam_start")
        .setLabel("Begin Examination")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("<:check:1525789302989258972>"),
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
