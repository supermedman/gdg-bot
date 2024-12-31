/*
  Node.js Libraries
*/

import fs from "node:fs";
import path from "node:path";

/*
  Our Dependencies
*/

import { executeCode } from "../sandbox.js";

/*
  Load all the commands from /commands, and return them.

  If a client is passed, also register each command on the client.
*/
export async function loadCommands(directory, client) {
  const commands = [];
  const commandFolders = fs.readdirSync(directory);

  for (const folder of commandFolders) {
    const commandsPath = path.join(directory, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const { default: command } = await import(filePath);
      
      if ('data' in command && 'execute' in command) {
        if (client) {
          client.commands.set(command.data.name, command);
          console.info(`[INFO] The command ${command.data.name} has been registered.`)
        }

        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  return commands;
}

/*
  Handle input commands.
*/
export async function handleInputCommand(interaction) {
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
}

/*
  Handle modal submits.
*/
export async function handleModalSubmit(interaction) {
  if ( ! interaction.isModalSubmit()) {
    return;
  }

  if (interaction.customId === 'modal-code') {
    const code = interaction.fields.getTextInputValue("code");

    await interaction.deferReply();

    try {
      const result = await executeCode(code);

      if (typeof result === 'undefined') {
        await interaction.followUp({
          content: [
            "## No result found!",
            "Are you sure you passed a result to `$()`?",
            "### Example:",
            "```js",
            '$(42);',
            "```"
          ].join("\n")
        });
        return;
      }

      await interaction.followUp({
        content: [
          "### Input",
          "```js",
          code,
          "```",
          "### Output",
          "```js",
          JSON.stringify(result, null, 4),
          "```"
        ].join("\n")
      });
    }
    catch(error) {
      let errMsg;

      if (error.isTimeout) {
        errMsg = "Sorry, but your code took too long to run!"
      }
      else {
        errMsg = error?.message ?? "Unknown error.";
      }

      await interaction.followUp({
        content: [
          "### Input",
          "```js",
          code,
          "```",
          "### Error",
          "```",
          errMsg,
          "```"
        ].join("\n")
      });
    }
	}
}
