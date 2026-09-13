import { Client, Events } from "discord.js";

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    // Early returns keep the code cleaner and avoid deep nesting
    if (!interaction.isButton()) return;
    if (interaction.customId !== "stage_1_completed") return;

    // Use { ephemeral: true } instead of { flags: 64 } for better discord.js compatibility
    await interaction.deferReply({ ephemeral: true });

    // Catch and log the error so you can see it in your console
    const member = await interaction.guild?.members
      .fetch(interaction.user.id)
      .catch((err) => {
        console.error("Failed to fetch member:", err);
        return null;
      });

    if (!member) {
      await interaction.editReply(
        "Error: Could not find your profile in this server.",
      );
      return;
    }

    const stage1_role_id = "1523408743545438229";
    const stage2_role_id = "1523408707134816417";

    try {
      // Use try/catch instead of empty .catch() blocks
      await member.roles.remove(stage1_role_id);
      await member.roles.add(stage2_role_id);

      await interaction.editReply("Good luck.");
    } catch (error) {
      // This will now tell you exactly WHY it's failing (e.g., Missing Permissions)
      console.error("Role Update Error:", error);
      await interaction.editReply(
        "There was a system error updating your roles. Please contact an admin.",
      );
    }
  });
};
