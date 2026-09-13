import { Client, Events } from "discord.js";
import { commands } from "../commands";

export default (client: Client): void => {
  client.on(Events.ClientReady, async () => {
    if (!client.user || !client.application) return;
    console.log(`Logged in as ${client.user.tag}`);

    client.guilds.cache.get("1523341747722391732")?.commands.set(commands);
  });
};
