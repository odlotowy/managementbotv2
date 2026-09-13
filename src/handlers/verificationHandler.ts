import {
  Client,
  ContainerBuilder,
  Events,
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
  MediaGalleryBuilder,
  MessageFlags,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";
import { GetUserRank } from "../utils/GetUserRank";
import { Manager } from "../models/Manager";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "verify_begin") {
      const modal = new ModalBuilder()
        .setTitle("Verification Request")
        .setCustomId("verify_modal");

      const roblox = new LabelBuilder()
        .setLabel("Roblox Username")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("roblox_username")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Your roblox username"),
        );

      const discord = new LabelBuilder()
        .setLabel("Discord Username")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("discord_username")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Your discord username"),
        );

      const invited = new LabelBuilder()
        .setLabel("Who invited you")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("invited")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Who invited you to the server"),
        );

      const proof = new LabelBuilder()
        .setLabel("Proof of invitation")
        .setFileUploadComponent(
          new FileUploadBuilder().setCustomId("proof").setRequired(true),
        );

      modal.addLabelComponents(roblox, discord, invited, proof);

      await interaction.showModal(modal);
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "verify_modal"
    ) {
      const roblox = interaction.fields.getTextInputValue("roblox_username");
      const discord = interaction.fields.getTextInputValue("discord_username");
      const invited = interaction.fields.getTextInputValue("invited");
      const proofFiles = interaction.fields.getUploadedFiles("proof");
      if (!proofFiles) return;
      const channelId = "1523378855937839236";
      const channel = interaction.guild?.channels.cache.get(channelId);
      let groupRank;

      const user = await GetUserRank(roblox);

      if (!user) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Failed to find this roblox user")
              .setColor("Red"),
          ],
          flags: 64,
        });
      }

      if (!channel?.isSendable()) return;

      const container = new ContainerBuilder();

      const text = new TextDisplayBuilder().setContent(
        "## New Verification Request\nA new Verification Request has been made and it's pending review.\n\n**User Information:**",
      );

      container.addTextDisplayComponents(text);

      groupRank = `${user.rankName}`;

      if (!user?.inGroup) {
        groupRank = "User is not in group";
      }

      // 💡 FIX: Create text builders and add them directly to the container, skipping SectionBuilder
      const sectionText1 = new TextDisplayBuilder().setContent(
        `> Roblox Username: ${roblox}`,
      );
      const sectionText2 = new TextDisplayBuilder().setContent(
        `> Discord Username: ${discord}`,
      );
      const sectionText3 = new TextDisplayBuilder().setContent(
        `> Rank in group: ${groupRank}`,
      );
      const sectionText4 = new TextDisplayBuilder().setContent(
        `> Who invited you: ${invited}`,
      );
      const sectionText5 = new TextDisplayBuilder().setContent(
        `> Proof of invitation: Please look at the image below.`,
      );

      container.addTextDisplayComponents(
        sectionText1,
        sectionText2,
        sectionText3,
        sectionText4,
        sectionText5,
      );

      const proof = new MediaGalleryBuilder().addItems(
        proofFiles.map((file) => ({
          media: {
            url: file.url,
          },
        })),
      );
      container.addMediaGalleryComponents(proof);

      const separator = new SeparatorBuilder();
      container.addSeparatorComponents(separator);

      const text2 = new TextDisplayBuilder().setContent(
        `Request made by ${interaction.user}`,
      );
      container.addTextDisplayComponents(text2);

      const approveButton = new ButtonBuilder()
        .setCustomId(`accept_verify_request:${interaction.user.id}:${roblox}`)
        .setLabel("Accept Verification Request")
        .setStyle(ButtonStyle.Success);

      const declineButton = new ButtonBuilder()
        .setCustomId(`decline_verify_request:${interaction.user.id}:${roblox}`)
        .setLabel("Decline Verification Request")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        approveButton,
        declineButton,
      );

      await channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container, row],
      });

      await interaction.reply({
        content:
          "Verification request has been submitted successfully! Please wait patiently for Management Leadership to review it.",
        flags: 64,
      });
    }

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("accept_verify_request:")
    ) {
      await interaction.deferUpdate();

      const [, userId, robloxUsername] = interaction.customId.split(":");

      const member = await interaction.guild?.members.fetch(userId);

      if (!member) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Member not found")
              .setColor("Red"),
          ],
          flags: 64,
        });
      }

      const robloxUser = await GetUserRank(robloxUsername);

      if (!robloxUser || !robloxUser.inGroup) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("User is no longer in the roblox group")
              .setColor("Red"),
          ],
          flags: 64,
        });
      }

      await member.setNickname(robloxUsername).catch((error) => {
        console.error(error);
      });

      // Roles to add
      const rolesToAdd = [
        "1523408925859250258",
        "1523408743545438229",
        "1523409078896951437",
      ];

      // Roles to remove
      const rolesToRemove = ["1523409115441791006"];

      // Role to add from the roblox group
      const rankRoles: Record<number, string> = {
        180: "1523703291198836857",
        192: "1523703255467692102",
        193: "1523703221447688202",
        194: "1523703184512647238",
        195: "1523703091919196251",
        197: "1523703054145159351",
        198: "1523703020548919438",
        199: "1523702989989220392",
        200: "1523702943516463124",
        216: "1523702901703442592",
        217: "1523702866022236392",
        218: "1523702828642734240",
        219: "1523702793045544970",
        220: "1523702744098279685",
      };

      const roleId = rankRoles[robloxUser.rankId];

      if (roleId) {
        await member.roles.add(roleId);
      }

      await member.roles.add(rolesToAdd).catch(() => {});
      await member.roles.remove(rolesToRemove).catch(() => {});

      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_verify_request:${userId}`)
          .setLabel("Accept Verification Request")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`decline_verify_request:${interaction.user.id}`)
          .setLabel("Decline Verification Request")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true),
      );

      // Map through current message components to keep V2 containers intact but swap the button row
      const updatedComponents = interaction.message.components.map(
        (component, index) => {
          if (index === 1) return disabledRow.toJSON(); // Replace button row
          return component.toJSON(); // Keep containers as they are
        },
      );

      try {
        await Manager.findOneAndUpdate(
          { discordId: userId }, // szukamy po Discord ID zweryfikowanego użytkownika
          {
            roblox: {
              userId: robloxUser.userId.toString(),
              username: robloxUser.username,
              avatar: robloxUser.avatar, // przekazujemy pobrany link URL awatara
              rankgroup: robloxUser.rankName,
              rankgroupid: robloxUser.rankId,
            },
            $setOnInsert: {
              stats: {
                loggedShifts: 0,
                tickets: 0,
                staffOfTheMonthRequests: 0,
              },
              activity: { streak: 0, strikes: 0 },
            },
          },
          { upsert: true, new: true },
        );
        console.log(`${robloxUser.username} has been added to the database.`);
      } catch (dbError) {
        console.error(
          "An unexpected error occured while adding to the database: ",
          dbError,
        );
      }

      // Update the original message with the disabled buttons
      await interaction.message.edit({
        components: updatedComponents,
      });

      try {
        await member.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Verification Request Accepted")
              .setDescription(
                "Greetings!\n\n> Your verification request has been accepted by the leadership. You now have full access to the server. We wish you best of luck on your internship program.",
              )
              .setColor(0x0a5e0c)
              .setImage(
                "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
              )
              .setFooter({
                text: `Request approved by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({
                  forceStatic: false,
                }),
              })
              .setTimestamp(),
          ],
        });
      } catch (error) {
        await interaction.followUp({
          content: "Failed to DM the user.",
          flags: 64,
        });
      }

      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(`Request accepted by ${interaction.user}`)
            .setColor(0x0a5e0c),
        ],
      });
    }

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("decline_verify_request:")
    ) {
      const userId = interaction.customId.split(":")[1];

      const modal = new ModalBuilder()
        .setCustomId(`decline_verify_modal:${userId}`)
        .setTitle("Decline Verification");

      const reason = new LabelBuilder()
        .setLabel("Reason")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("reason")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Provide the reason for declining this request")
            .setRequired(true),
        );

      modal.addLabelComponents(reason);

      await interaction.showModal(modal);
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("decline_verify_modal:")
    ) {
      const userId = interaction.customId.split(":")[1];
      const reason = interaction.fields.getTextInputValue("reason");

      const member = await interaction.guild?.members.fetch(userId);

      if (!member) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Member not found")
              .setColor("Red"),
          ],
          flags: 64,
        });
      }

      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_verify_request:${userId}`)
          .setLabel("Accept Verification Request")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`decline_verify_request:${userId}`)
          .setLabel("Decline Verification Request")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true),
      );

      // Map through current message components to keep V2 containers intact but swap the button row
      const updatedComponents = interaction.message?.components.map(
        (component, index) => {
          if (index === 1) return disabledRow.toJSON(); // Replace button row (3rd component)
          return component.toJSON(); // Keep containers as they are
        },
      );

      // Update the original message with the disabled buttons
      await (interaction as any).update({
        components: updatedComponents,
      });

      try {
        await member.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Verification Request Declined")
              .setDescription(
                `Greetings!\n\n> Your verification request has been declined by the leadership. If you believe this is a mistake, please contact the management leadership team.\n\n**Reason**: ${reason}`,
              )
              .setColor(0xd42319)
              .setImage(
                "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
              )
              .setFooter({
                text: `Request declined by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({
                  forceStatic: false,
                }),
              })
              .setTimestamp(),
          ],
        });
      } catch (error) {
        await interaction.followUp({
          content: "Failed to DM the user.",
          flags: 64,
        });
      }

      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Request declined by ${interaction.user}\n**Reason:** ${reason}`,
            )
            .setColor(0xd42319),
        ],
      });
    }
  });
};
