import { Client, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config";
import ready from "./events/ready";
import { connectDB } from "./utils/database";
import interactionCreate from "./events/interactionCreate";
import verificationHandler from "./handlers/verificationHandler";
import GiveVerificationRequiredRole from "./events/GiveVerificationRequiredRole";
import StaffOfTheMonthHandler from "./handlers/StaffOfTheMonthHandler";
import SupportHandler from "./handlers/SupportHandler";
import TrainingProgram from "./handlers/TrainingProgram";
import Examination from "./handlers/Examination";

console.log("Bot is starting...");

const client = new Client({
  partials: [
    Partials.Message, // for message
    Partials.Channel, // for text channel
    Partials.GuildMember, // for guild member
    Partials.Reaction, // for message reaction
    Partials.GuildScheduledEvent, // for guild events
    Partials.User, // for discord user
    Partials.ThreadMember, // for thread member
  ],
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildMembers, // for guild members related things
    GatewayIntentBits.GuildIntegrations, // for discord Integrations
    GatewayIntentBits.GuildWebhooks, // for discord webhooks
    GatewayIntentBits.GuildInvites, // for guild invite managing
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildPresences, // for user presence things
    GatewayIntentBits.GuildMessages, // for guild messages things
    GatewayIntentBits.GuildMessageReactions, // for message reactions things
    GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.DirectMessages, // for dm messages
    GatewayIntentBits.DirectMessageReactions, // for dm message reaction
    GatewayIntentBits.DirectMessageTyping, // for dm message typinh
    GatewayIntentBits.MessageContent, // enable if you need message content things
    GatewayIntentBits.GuildModeration, // for moderation logs
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
});

connectDB();
ready(client);
interactionCreate(client);
verificationHandler(client);
GiveVerificationRequiredRole(client);
StaffOfTheMonthHandler(client);
SupportHandler(client);
TrainingProgram(client);
Examination(client);

client.login(process.env.token);
