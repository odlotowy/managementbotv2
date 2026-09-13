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

export const theorydone: command = {
  name: "theory-done",
  description: "Send a embed for the theory section",
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
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
      .setTitle("Stage 1 Completed")
      .setDescription(
        "By clicking the button below you confirm that you have read all the information provided in the stage 1.",
      )
      .setColor("Grey");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("stage_1_completed")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("<:check:1525789302989258972>"),
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
