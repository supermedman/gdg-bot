/*
  Node.js Libraries
*/

import path from "node:path";

/*
  NPM Dependencies
*/

import "dotenv/config";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

/*
  Our Dependencies
*/

import {
  handleInputCommand,
  handleModalSubmit,
  loadCommands
} from "./utilities/commands.js";

import {
  handleMessageCreate,
  loadHooks
} from "./utilities/messages.js";

/*
  Constants
*/

if ( ! process.env.DISCORD_TOKEN) {
  throw new Error("No DISCORD_TOKEN found in .env file.");
  process.exit(1);
}

const __dirname = import.meta.dirname;

const { DISCORD_TOKEN, STATIC_HOOK_REF } = process.env;
const COMMANDS_PATH = path.join(__dirname, 'commands');

/*
  Client Initialisation & Events
*/

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.activeHooks = new Collection();

client.hookLoader = {
  staticLoc: STATIC_HOOK_REF,
  currentLoc: STATIC_HOOK_REF,
  get filePath() {
    this.currentLoc = this.staticLoc + `?=${Date.now()}`
    return this.currentLoc;
  },
  async getFileContents() {
    return (await import(this.currentLoc, { with: { type: "json" } } )).default;
  }
};

await loadCommands(COMMANDS_PATH, client);
await loadHooks(client);

client.once(Events.ClientReady, readyClient => {
	console.log(`[INFO] Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  handleInputCommand(interaction);
  handleModalSubmit(interaction);
});

client.on(Events.MessageCreate, async message => {
  handleMessageCreate(message, client);
});

client.login(DISCORD_TOKEN);
