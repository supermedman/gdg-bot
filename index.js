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

const { DISCORD_TOKEN, HOOK_FILE_PATH } = process.env;
const COMMANDS_PATH = path.join(__dirname, 'commands');

/*
  Client Initialisation & Events
*/

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
client.activeHooks = new Collection();

/**@typedef { { id: string, parentid: string, threadid: string } } StoredHook */

/**
 * Special Loader Object
 * 
 * Used to simplify the process of overwriting import cache data.
 * This is to ensure that all changes made to the webhook json file are updated correctly and the data being used
 * is the most recent.
 */
client.hookLoader = {
  staticLoc: HOOK_FILE_PATH,
  currentLoc: HOOK_FILE_PATH,
  /**
   * This getter is used to append a new import path to force updated data when retrieving file contents
   */
  get filePath() {
    this.currentLoc = this.staticLoc + `?=${Date.now()}`
    return this.currentLoc;
  },
  /**
   * This method returns the entire stored contents within the webhook json file. 
   * It will return the contents stored as they were last set (Caused by some form of update)
   * 
   * @returns { StoredHook[] } Stored file contents in their most updated state
   */
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
