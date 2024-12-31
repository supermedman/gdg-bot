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

import { loadCommands } from "./utilities/commands.js";

/*
  Constants
*/

if ( ! process.env.DISCORD_TOKEN) {
  throw new Error("No DISCORD_TOKEN found in .env file.");
  process.exit(1);
}

const __dirname = import.meta.dirname;

const { DISCORD_TOKEN } = process.env;
const COMMANDS_PATH = path.join(__dirname, 'commands');

/*
  Client Initialisation & Events
*/

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

await loadCommands(COMMANDS_PATH, client);

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if ( ! interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

	if ( ! command) {
		return console.error(`No command matching ${interaction.commandName} was found.`);
	}

  try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral
      });
		} else {
			await interaction.reply({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral
      });
		}
	}
});

client.login(DISCORD_TOKEN);
