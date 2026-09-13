import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  ContainerBuilder,
  MediaGalleryBuilder,
  MessageFlags,
  PermissionFlagsBits,
  TextDisplayBuilder,
} from "discord.js";
import { command } from "../../types";

export const contact: command = {
  name: "contact",
  description: "Sends the contact embed",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) return;
    if (!interaction.channel || !interaction.channel.isSendable()) return;

    const mediaContainer = new ContainerBuilder();
    const contactContainer = new ContainerBuilder();

    const media = new MediaGalleryBuilder().addItems([
      {
        media: {
          url: "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
        },
      },
    ]);
    mediaContainer.addMediaGalleryComponents(media);

    const text = new TextDisplayBuilder().setContent(
      `## FreshWay Management Department - Support Section\n\n> If you have any questions or issues, please click the 'General Support' button. It will open a support ticket and the management leadership will answer you as soon as possible.\n\n> If you need to go on LOA, please click the 'LOA Request' button and fill out the form. Management Leadership will review it as soon as possible.\n\n> If you need to go on RA, please click the 'RA Request' button and fill out the form. Management Leadership will review it as soon as possible.\n\n> If you think a manager is abusing the rank or not following the rules. Or if the manager's behavior is inappropriate. Feel free to open a 'Manager Report' ticket.`,
    );
    contactContainer.addTextDisplayComponents(text);

    const support = new ButtonBuilder()
      .setCustomId(`support_ticket`)
      .setLabel("General Support")
      .setStyle(ButtonStyle.Success);

    const loa = new ButtonBuilder()
      .setCustomId(`loa_request`)
      .setLabel("LOA Request")
      .setStyle(ButtonStyle.Secondary);

    const ra = new ButtonBuilder()
      .setLabel(`RA Request`)
      .setCustomId(`ra_request`)
      .setStyle(ButtonStyle.Secondary);

    const report = new ButtonBuilder()
      .setCustomId(`manager_report`)
      .setLabel("Manager Report")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      support,
      report,
      loa,
      ra,
    );

    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [mediaContainer, contactContainer, row],
    });

    await interaction.reply({
      content: `Contact embed sent successfully!`,
      flags: 64,
    });
  },
};
