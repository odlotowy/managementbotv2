import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
} from "discord.js";
import { command } from "../../types";

export const announcement: command = {
  name: "announcement",
  description: "Make an announcement",
  defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
  options: [
    {
      name: "channel",
      description: "Channel where you want the announcement to be send",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "role",
      description: "Role you want to ping",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;

    const { options } = interaction;

    const channel = options.getChannel("channel");
    const role = options.getRole("role");
    if (!channel) return;
    const guildChannel = interaction.guild.channels.cache.get(channel.id);

    await interaction.reply({
      content: `Please send the announcement you want to send on this channel. You have 60 seconds before the collector expires.`,
    });

    if (
      !interaction.channel ||
      !interaction.channel.isTextBased() ||
      !("awaitMessages" in interaction.channel)
    )
      return;

    const interactionChannel = interaction.channel;
    const interactionChannelId = interactionChannel.id;

    const filter = (message: Message) =>
      message.author.id === interaction.user.id &&
      message.channel.id === interactionChannelId;

    try {
      const collected = await interactionChannel.awaitMessages({
        filter,
        max: 1,
        time: 60000,
        errors: ["time"],
      });

      const announcementMessage = collected.first();
      if (!announcementMessage) return;

      if (!guildChannel || !guildChannel.isTextBased()) return;
      await guildChannel.send({
        content: announcementMessage.content,
        files: [...announcementMessage.attachments.values()].map(
          (attachment) => attachment.url,
        ),
      });

      if (role) {
        const pingMessage = await guildChannel.send({
          content: `${role}`,
          allowedMentions: {
            roles: [role.id],
          },
        });

        setTimeout(async () => {
          try {
            await pingMessage.delete();
          } catch {}
        }, 5000);
      }

      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:greentick:1516889005596217486> Announcement has been sent to ${channel} successfully`,
            )
            .setColor("Green"),
        ],
      });
    } catch (error) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `<:redtick:1516888955046596738> No message received within 60 seconds`,
            )
            .setColor("Red"),
        ],
      });
    }
  },
};
