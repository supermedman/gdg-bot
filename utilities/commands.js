import fs from "node:fs";
import path from "node:path";

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
