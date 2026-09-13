import { Client, Events } from "discord.js";

export default (client: Client): void => {
  client.on(Events.GuildMemberAdd, async (member) => {
    if (!member) return;

    await member.roles.add("1523409115441791006").catch(() => {});
  });
};
