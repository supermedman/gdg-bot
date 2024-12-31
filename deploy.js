/*
  Node.js Libraries
*/

import path from "node:path";

/*
  NPM Dependencies
*/

import "dotenv/config";
import { REST, Routes } from "discord.js";

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

if ( ! process.env.APPLICATION_ID) {
  throw new Error("No APPLICATION_ID found in .env file.");
  process.exit(1);
}

if ( ! process.env.SERVER_ID) {
  throw new Error("No SERVER_ID found in .env file.");
  process.exit(1);
}

const __dirname = import.meta.dirname;

const {
  DISCORD_TOKEN,
  APPLICATION_ID,
  SERVER_ID
} = process.env;
const COMMANDS_PATH = path.join(__dirname, 'commands');

/*
  Deployment
*/

const commands = await loadCommands(COMMANDS_PATH);
const rest = new REST().setToken(DISCORD_TOKEN);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  const data = await rest.put(
    Routes.applicationGuildCommands(APPLICATION_ID, SERVER_ID),
    { body: commands },
  );

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
  console.error(error);
}
