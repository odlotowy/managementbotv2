import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  ContainerBuilder,
  EmbedBuilder,
  Events,
  FileUploadBuilder,
  LabelBuilder,
  MediaGalleryBuilder,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  SeparatorBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CONFIG } from "../@types/support-config";
import { GetUserRank } from "../utils/GetUserRank";
import { parseAndValidateDate } from "../utils/ParseAndValidateDateFunction";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      // ---> TICKET SUPPORT
      if (interaction.customId === "support_ticket") {
        await interaction.deferReply({ flags: 64 });

        try {
          const ticketChannel = await interaction.guild?.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.TICKET_CATEGORY_ID || null,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
              {
                id: CONFIG.SUPPORT_ROLE_ID,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
            ],
          });

          const welcomeEmbed = new EmbedBuilder()
            .setDescription(
              "Thank you for contacting the management leadership. Please describe your issue / state your question and wait for a response.",
            )
            .setColor("DarkGreen")
            .setThumbnail(interaction.guild?.iconURL() || null)
            .setFooter({
              text: "FreshWay Management Department",
            });

          const closeButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("Close Ticket")
                .setEmoji("<:disconnected:1525789374686429314>")
                .setStyle(ButtonStyle.Danger),
            );

          await ticketChannel?.send({
            embeds: [welcomeEmbed],
            components: [closeButton],
            content: `||<@&${CONFIG.SUPPORT_ROLE_ID}><@${interaction.user.id}>||`,
          });
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `<:check:1525789302989258972> Ticket created successfully: ${ticketChannel}`,
                )
                .setColor("Green"),
            ],
          });
        } catch (error) {
          console.error(error);
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "<:cross1:1525789345376768020> An unexpected error occured.",
                )
                .setColor("Red"),
            ],
          });
        }
      }

      // ---> CLOSE TICKET
      if (interaction.customId === "close_ticket") {
        const memberRoles = interaction.member?.roles;

        // Bezpiecznie sprawdzamy typ
        const hasSupportRole = Array.isArray(memberRoles)
          ? memberRoles.includes(CONFIG.SUPPORT_ROLE_ID)
          : memberRoles?.cache.has(CONFIG.SUPPORT_ROLE_ID);

        if (!hasSupportRole) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> You do not have permission to close tickets.",
              ),
            ],
            flags: 64,
          });
        }

        await interaction.reply({
          content: "Ticket will be closed in 5 seconds...",
        });

        setTimeout(() => interaction.channel?.delete().catch(() => null), 5000);
      }

      // ---> MANAGER REPORT
      if (interaction.customId === "manager_report") {
        const modal = new ModalBuilder()
          .setTitle("Manager Report")
          .setCustomId("manager_report_modal");

        const robloxUsername = new LabelBuilder()
          .setLabel("Roblox Username")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("roblox_username_report")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          );

        const reason = new LabelBuilder()
          .setLabel("Reason of the report")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("reason_report")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true),
          );

        const proof = new LabelBuilder()
          .setLabel("Proof")
          .setFileUploadComponent(
            new FileUploadBuilder()
              .setCustomId("proof_report")
              .setRequired(true),
          );

        modal.addLabelComponents(robloxUsername, reason, proof);

        await interaction.showModal(modal);
      }

      // ---> RA REQUEST
      if (interaction.customId === "ra_request") {
        const modal = new ModalBuilder()
          .setTitle("RA Request")
          .setCustomId("ra_request_modal");

        const raStart = new LabelBuilder()
          .setLabel("RA Start Date")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("ra_request_start")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Example: 13-07-2026"),
          );

        const raEnd = new LabelBuilder()
          .setLabel("RA End Date")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("ra_request_end")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Example: 19-07-2026"),
          );

        const reason = new LabelBuilder()
          .setLabel("Reason for the RA")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("ra_request_reason")
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder("Example: Education, Holiday, Personal etc."),
          );

        modal.addLabelComponents(raStart, raEnd, reason);

        await interaction.showModal(modal);
      }

      // ---> LOA REQUEST
      if (interaction.customId === "loa_request") {
        const modal = new ModalBuilder()
          .setTitle("LOA Request")
          .setCustomId("loa_request_modal");

        const raStart = new LabelBuilder()
          .setLabel("LOA Start Date")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("loa_request_start")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Example: 13-07-2026"),
          );

        const raEnd = new LabelBuilder()
          .setLabel("LOA End Date")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("loa_request_end")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Example: 19-07-2026"),
          );

        const reason = new LabelBuilder()
          .setLabel("Reason for the LOA")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("loa_request_reason")
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder("Example: Education, Holiday, Personal etc."),
          );

        modal.addLabelComponents(raStart, raEnd, reason);

        await interaction.showModal(modal);
      }

      if (interaction.customId.startsWith("accept_report_request:")) {
        await interaction.deferUpdate();

        const [, userId, robloxUsername] = interaction.customId.split(":");

        const member = interaction.guild?.members.cache.get(userId);
        if (!member) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> User not found",
              ),
            ],
            flags: 64,
          });
        }

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_report_request:${userId}`)
            .setLabel("Accept Manager Report")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(`decline_reply_request:${interaction.user.id}`)
            .setLabel("Decline Manager Report")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

        const updatedComponents = interaction.message.components.map(
          (component, index) => {
            if (index === 1) return disabledRow.toJSON();
            return component.toJSON();
          },
        );

        await interaction.message.edit({
          components: updatedComponents,
        });

        const roblox = await GetUserRank(robloxUsername);
        const robloxId = roblox?.userId;

        try {
          const embed = new EmbedBuilder()
            .setTitle("Manager Report Accepted")
            .setDescription(
              `Greetings!\n\n> Your manager report has been marked as **accepted**. Appropriate actions will be taken against **${robloxUsername}** \`(${robloxId})\` shortly. We appreciate your effort into maintaining FreshWay a safe place for everyone!`,
            )
            .setColor(0x0a5a0c)
            .setImage(
              "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
            )
            .setFooter({
              text: `Report accepted by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL({
                forceStatic: false,
              }),
            })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Failed to DM the user",
              ),
            ],
          });
        }

        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:check:1525789302989258972> Report accepted by ${interaction.user}`,
              )
              .setColor(0x0a5e0c),
          ],
        });
      }

      if (interaction.customId.startsWith("decline_report_request:")) {
        const [, userId, robloxUsername] = interaction.customId.split(":");

        const modal = new ModalBuilder()
          .setTitle("Decline Manager Report")
          .setCustomId(`decline_report_modal:${userId}:${robloxUsername}`);

        const reason = new LabelBuilder()
          .setLabel("Reason")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("decline_reason_modal")
              .setStyle(TextInputStyle.Paragraph),
          );

        modal.addLabelComponents(reason);

        await interaction.showModal(modal);
      }

      if (interaction.customId.startsWith("accept_loa_request:")) {
        await interaction.deferUpdate();

        const [, userId, start, end, ...reasonParts] =
          interaction.customId.split(":");
        const reason = reasonParts.join(":");

        const member = interaction.guild?.members.cache.get(userId);
        if (!member) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> User not found",
              ),
            ],
            flags: 64,
          });
        }

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            // Limit reason dla accept button, by uniknąć 100 char limit error:
            .setCustomId(
              `accept_loa_request:${userId}:${start}:${end}:${reason.substring(0, 27)}`,
            )
            .setLabel("Accept LOA Request")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(
              `decline_loa_request:${userId}:${start}:${end}:${reason.substring(0, 27)}`,
            )
            .setLabel("Decline LOA Request")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

        const updatedComponents = interaction.message.components.map(
          (component, index) => {
            if (index === 1) return disabledRow.toJSON();
            return component.toJSON();
          },
        );

        await interaction.message.edit({
          components: updatedComponents,
        });

        try {
          const embed = new EmbedBuilder()
            .setTitle("LOA Request Accepted")
            .setDescription(
              `Greetings!\n\n> Your LOA request has been marked as **accepted**.\n\n**LOA Information:**\n**Start Date:** ${start}\n**End Date:** ${end}\n**Reason:** ${reason}\n\n Enjoy your Leave of Absence! If you have any questions, feel free to contact the management leadership.`,
            )
            .setColor(0x0a5a0c)
            .setImage(
              "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
            )
            .setFooter({
              text: `Request accepted by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL({
                forceStatic: false,
              }),
            })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Failed to DM the user",
              ),
            ],
          });
        }

        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:check:1525789302989258972> Report accepted by ${interaction.user}`,
              )
              .setColor(0x0a5e0c),
          ],
        });
      }

      if (interaction.customId.startsWith("decline_loa_request:")) {
        const [, userId, start, end, ...reasonParts] =
          interaction.customId.split(":");
        const reasonLoa = reasonParts.join(":");

        const modal = new ModalBuilder()
          .setTitle("Decline LOA Request")
          .setCustomId(
            `decline_loa_modal:${userId}:${start}:${end}:${reasonLoa}`,
          );

        const reason = new LabelBuilder()
          .setLabel("Reason")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("decline_loa_reason_modal")
              .setStyle(TextInputStyle.Paragraph),
          );

        modal.addLabelComponents(reason);

        await interaction.showModal(modal);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("decline_report_modal:")) {
        await interaction.deferUpdate();

        if (!interaction.message) return;

        const [, userId, robloxUsername] = interaction.customId.split(":");

        const reason = interaction.fields.getTextInputValue(
          "decline_reason_modal",
        );

        const member = interaction.guild?.members.cache.get(userId);
        if (!member) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> User not found",
              ),
            ],
            flags: 64,
          });
        }

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_report_request:${userId}`)
            .setLabel("Accept Manager Report")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(`decline_reply_request:${userId}`)
            .setLabel("Decline Manager Report")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

        const updatedComponents = interaction.message.components.map(
          (component, index) => {
            if (index === 1) return disabledRow.toJSON();
            return component.toJSON();
          },
        );

        await interaction.message.edit({
          components: updatedComponents,
        });

        const roblox = await GetUserRank(robloxUsername);
        const robloxId = roblox?.userId;

        try {
          const embed = new EmbedBuilder()
            .setTitle("Manager Report Declined")
            .setDescription(
              `Greetings!\n\n> Your manager report has been marked as **declined**. Appropriate actions will not be taken against **${robloxUsername}** \`(${robloxId})\`. We appreciate your effort into maintaining FreshWay a safe place for everyone!\n\n**Reason:** ${reason}`,
            )
            .setColor(0xd62433)
            .setImage(
              "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
            )
            .setFooter({
              text: `Report declined by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL({
                forceStatic: false,
              }),
            })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Failed to DM the user",
              ),
            ],
          });
        }

        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:check:1525789302989258972> Report rejected by ${interaction.user}\n**Reason:** ${reason}`,
              )
              .setColor(0x0a5e0c),
          ],
        });
      }

      if (interaction.customId.startsWith("decline_loa_modal:")) {
        await interaction.deferUpdate();

        const [, userId, start, end, ...reasonParts] =
          interaction.customId.split(":");
        const reasonLoa = reasonParts.join(":");
        const reason = interaction.fields.getTextInputValue(
          "decline_loa_reason_modal",
        );

        const member = interaction.guild?.members.cache.get(userId);
        if (!member) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> User not found",
              ),
            ],
            flags: 64,
          });
        }

        if (!interaction.message) return;

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(
              `accept_loa_request:${userId}:${start}:${end}:${reasonLoa.substring(0, 27)}`,
            )
            .setLabel("Accept LOA Request")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(
              `decline_loa_request:${userId}:${start}:${end}:${reasonLoa.substring(0, 27)}`,
            )
            .setLabel("Decline LOA Request")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        );

        const updatedComponents = interaction.message.components.map(
          (component, index) => {
            if (index === 1) return disabledRow.toJSON();
            return component.toJSON();
          },
        );

        await interaction.message.edit({
          components: updatedComponents,
        });

        try {
          const embed = new EmbedBuilder()
            .setTitle("LOA Request Declined")
            .setDescription(
              `Greetings!\n\n> Your LOA request has been marked as **declined**.\n\n**LOA Information:**\n**Start Date:** ${start}\n**End Date:** ${end}\n**Reason:** ${reasonLoa}\n\n> Reason: ${reason}\n\n If you have any questions, feel free to contact management leadership.`,
            )
            .setColor(0xe03b1b)
            .setImage(
              "https://cdn.discordapp.com/attachments/1523377560883560640/1525785030608293968/FreshWay_MGMT_Banner.png?ex=6a54a58b&is=6a53540b&hm=e1f859e6ceb86088bc4e04c066775674c99f112f84c9ce96626ac4e5d1626016",
            )
            .setFooter({
              text: `Request declined by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL({
                forceStatic: false,
              }),
            })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Failed to DM the user",
              ),
            ],
          });
        }

        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `<:check:1525789302989258972> Report declined by ${interaction.user}\n**Reason:** ${reason}`,
              )
              .setColor(0x0a5e0c),
          ],
        });
      }

      if (interaction.customId === "manager_report_modal") {
        await interaction.deferReply({ flags: 64 });

        const roblox = interaction.fields.getTextInputValue(
          "roblox_username_report",
        );
        const reason = interaction.fields.getTextInputValue("reason_report");
        const proofFiles = interaction.fields.getUploadedFiles("proof_report");

        if (!proofFiles) {
          return interaction.editReply({
            content: "Proof is missing. Please provide it.",
          });
        }

        let groupRank;

        const user = await GetUserRank(roblox);

        if (!user) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Failed to find this roblox user",
              ),
            ],
          });
        }

        groupRank = `${user.rankName}`;

        if (!user?.inGroup) {
          groupRank = "User is not in group";
        }

        const channel = interaction.guild?.channels.cache.get(
          CONFIG.MANAGER_REPORT_CHANNEL_ID,
        );
        if (!channel || !channel.isSendable()) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `<:cross1:1525789345376768020> Channel configuration error. Please contact a bot administrator.`,
              ),
            ],
          });
        }

        const container = new ContainerBuilder();

        const text = new TextDisplayBuilder().setContent(
          `## New Manager Report\nA new manager report has been made and it's pending review\n\n**Manager Information:**`,
        );
        container.addTextDisplayComponents(text);

        const sectionText1 = new TextDisplayBuilder().setContent(
          `> Roblox Username: ${roblox}`,
        );
        const sectionText2 = new TextDisplayBuilder().setContent(
          `> Rank in group: ${groupRank}`,
        );
        const sectionText3 = new TextDisplayBuilder().setContent(
          `> Reason: ${reason}`,
        );
        const sectionText4 = new TextDisplayBuilder().setContent(
          `> Proof: Please look at the image below.`,
        );

        container.addTextDisplayComponents(
          sectionText1,
          sectionText2,
          sectionText3,
          sectionText4,
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
          `Report made by ${interaction.user}`,
        );
        container.addTextDisplayComponents(text2);

        const approveButton = new ButtonBuilder()
          .setCustomId(`accept_report_request:${interaction.user.id}:${roblox}`)
          .setLabel("Accept Manager Report")
          .setStyle(ButtonStyle.Success);

        const declineButton = new ButtonBuilder()
          .setCustomId(
            `decline_report_request:${interaction.user.id}:${roblox}`,
          )
          .setLabel("Decline Manager Report")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          approveButton,
          declineButton,
        );

        await channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: [container, row],
        });

        await interaction.editReply({
          content:
            "Manager report has been submitted successfully! Please wait patiently for Management Leadership to review it.",
        });
      }

      if (interaction.customId === "loa_request_modal") {
        await interaction.deferReply({ flags: 64 });

        const start = interaction.fields.getTextInputValue("loa_request_start");
        const end = interaction.fields.getTextInputValue("loa_request_end");
        const reason =
          interaction.fields.getTextInputValue("loa_request_reason");

        const startDate = parseAndValidateDate(start, 1);
        const endDate = parseAndValidateDate(end, 0);

        if (!startDate || !endDate) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Please make sure you use the correct format and your Leave of Absence starts on monday, and ends on sunday.",
              ),
            ],
          });
        }

        if (startDate >= endDate) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Start date must be earlier than the end date",
              ),
            ],
          });
        }

        const channel = interaction.guild?.channels.cache.get(
          CONFIG.LOA_CHANNEL_ID,
        );
        if (!channel || !channel.isSendable()) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `<:cross1:1525789345376768020> Channel configuration error. Please contact a bot administrator.`,
                )
                .setColor("Red"),
            ],
          });
        }

        const container = new ContainerBuilder();

        const text = new TextDisplayBuilder().setContent(
          `## New Leave of Absence (LOA) Request\nA new Leave of Absence (LOA) request has been made and it's pending review\n\n**LOA Information:**`,
        );
        container.addTextDisplayComponents(text);

        const sectionText1 = new TextDisplayBuilder().setContent(
          `> LOA Start Date: ${start}`,
        );
        const sectionText2 = new TextDisplayBuilder().setContent(
          `> LOA End Date: ${end}`,
        );
        const sectionText3 = new TextDisplayBuilder().setContent(
          `> Reason: ${reason}`,
        );

        container.addTextDisplayComponents(
          sectionText1,
          sectionText2,
          sectionText3,
        );

        const separator = new SeparatorBuilder();
        container.addSeparatorComponents(separator);

        const text2 = new TextDisplayBuilder().setContent(
          `Request made by ${interaction.user}`,
        );
        container.addTextDisplayComponents(text2);

        const safeReasonForId =
          reason.length > 30 ? reason.substring(0, 27) + "..." : reason;

        const approveButton = new ButtonBuilder()
          .setCustomId(
            `accept_loa_request:${interaction.user.id}:${start}:${end}:${safeReasonForId}`,
          )
          .setLabel("Accept LOA Request")
          .setStyle(ButtonStyle.Success);

        const declineButton = new ButtonBuilder()
          .setCustomId(
            `decline_loa_request:${interaction.user.id}:${start}:${end}:${safeReasonForId}`,
          )
          .setLabel("Decline LOA Request")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          approveButton,
          declineButton,
        );

        await channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: [container, row],
        });

        await interaction.editReply({
          content:
            "Your LOA request has been submitted successfully! Please wait patiently for Management Leadership to review it.",
        });
      }

      if (interaction.customId === "ra_request_modal") {
        await interaction.deferReply({ flags: 64 });

        const start = interaction.fields.getTextInputValue("ra_request_start");
        const end = interaction.fields.getTextInputValue("ra_request_end");
        const reason =
          interaction.fields.getTextInputValue("ra_request_reason");

        const startDate = parseAndValidateDate(start, 1);
        const endDate = parseAndValidateDate(end, 0);

        if (!startDate || !endDate) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Please make sure you use the correct format and your Reduced Activity starts on monday, and ends on sunday.",
              ),
            ],
          });
        }

        if (startDate >= endDate) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                "<:cross1:1525789345376768020> Start date must be earlier than the end date",
              ),
            ],
          });
        }

        const channel = interaction.guild?.channels.cache.get(
          CONFIG.RA_CHANNEL_ID,
        );
        if (!channel || !channel.isSendable()) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `<:cross1:1525789345376768020> Channel configuration error. Please contact a bot administrator.`,
                )
                .setColor("Red"),
            ],
          });
        }

        const container = new ContainerBuilder();

        const text = new TextDisplayBuilder().setContent(
          `## New Reduced Activity (RA) Request\nA new Reduced Activity (RA) request has been made and it's pending review\n\n**LOA Information:**`,
        );
        container.addTextDisplayComponents(text);

        const sectionText1 = new TextDisplayBuilder().setContent(
          `> RA Start Date: ${start}`,
        );
        const sectionText2 = new TextDisplayBuilder().setContent(
          `> RA End Date: ${end}`,
        );
        const sectionText3 = new TextDisplayBuilder().setContent(
          `> Reason: ${reason}`,
        );

        container.addTextDisplayComponents(
          sectionText1,
          sectionText2,
          sectionText3,
        );

        const separator = new SeparatorBuilder();
        container.addSeparatorComponents(separator);

        const text2 = new TextDisplayBuilder().setContent(
          `Request made by ${interaction.user}`,
        );
        container.addTextDisplayComponents(text2);

        await channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: [container],
        });

        await interaction.editReply({
          content:
            "Your RA request has been submitted successfully! Please wait patiently for Management Leadership to review it.",
        });
      }
    }
  });
};
