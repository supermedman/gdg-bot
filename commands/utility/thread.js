import { SlashCommandBuilder } from "discord.js";

import { GIT_LOGS_CHANNEL_ID } from process.env;
import { updateHookFile } from "../../utilities/messages";

const data = new SlashCommandBuilder()
  .setName('thread')
  .setDescription('Perform an action with threads')
  .addSubcommand(subcommand =>
    subcommand
    .setName('hook')
    .setDescription('Perform an action between a webhook and a thread')
    .addStringOption(option => 
      option
      .setName('action')
      .setDescription('The action to be performed')
      .setRequired(true)
      .addChoices(
        { name: "Add a Hook", value: "add" },
        { name: "Remove a Hook", value: "remove" },
        { name: "Update a Hook", value: "update" },
        { name: "View a Hook", value: "view" },
      )
    )
    .addStringOption(option => 
      option
      .setName('hookid')
      .setDescription('The webhook id to perform the action on')
      .setRequired(true)
    )
    .addStringOption(option => 
      option
      .setName('threadid')
      .setDescription('If adding/updating a hook this id will be used as the new location')
    )
  );

async function execute(interaction) {
  // MOVE TO .env =>  GIT_LOGS_CHANNEL_ID:'1330370240516980907'
  const webHookChannel = interaction.client.channels.cache.get(GIT_LOGS_CHANNEL_ID);
  try {
    // Hook payload
    const threadUpdates = {};

    // TODO: Save to json to retain through reloads
    await updateHookFile(interaction.client, threadUpdates);
  } catch (e) {
    console.error('Failed to perform WebHook action: ', e);
  }

  await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
}

export default { data, execute };