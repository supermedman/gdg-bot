import { SlashCommandBuilder, MessageFlages, EmbedBuilder } from "discord.js";

// MOVE TO .env =>  GIT_LOGS_CHANNEL_ID:'1330370240516980907'
// MOVE TO .env =>  PROJECT_CHANNEL_ID:'1330336033610666026'
import { GIT_LOGS_CHANNEL_ID, PROJECT_CHANNEL_ID } from process.env;
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
  /*
    User Inputs
  */
  const action = interaction.options.getString('action');
  const webhookId = interaction.options.getString('hookid');
  const threadId = interaction.options.getString('threadid') ?? '0';

  if (
    (action === 'add' || action === 'update') && 
    threadId === '0'
  ) return await interaction.reply({ content: `threadid is required when adding/updating a hook!!`, flags: MessageFlages.Ephemeral });

  const webHookChannel = interaction.client.channels.cache.get(GIT_LOGS_CHANNEL_ID);
  try {
    const existingHooks = await webHookChannel.fetchWebhooks();
    const matchingHook = existingHooks.find(hook => hook.id === webhookId);
    if ( ! matchingHook) throw new Error('Invalid webhookId given, no matches found!!');
    /*
      Special Handle for View Action
    */
    if (action === 'view') {
      if (! interaction.client.activeHooks.has(webhookId)) throw new Error('Failed to display stored webhook: Webhook has not yet been added!!');
      
      const [parentid, threadid] = interaction.client.activeHooks.get(webhookId);
      const parentChannel = await interaction.client.guilds.fetch(message.guildid).then(async (g) => await g.channels.fetch(parentid));
      const recievingThread = parentChannel.threads.cache.get(threadid);

      const hookEmbed = new EmbedBuilder()
        .setTitle('== Webhook ==')
        .setDescription(`Webhook ID: ${webhookId}\n> Parent Channel: ${parentChannel.name}\n> Thread Reciving: ${recievingThread.name}`);

      return await interaction.reply({ embeds: [hookEmbed] });
    }

    // Hook payload
    const threadPayload = {
      id: webhookId,
      parentid: PROJECT_CHANNEL_ID,
      threadid: threadId
    };

    await updateHookFile(interaction.client, threadPayload, action);
  } catch (e) {
    console.error('Failed to perform WebHook action: ', e);
    return await interaction.reply({ content: `Failed to ${action.toUpperCase()} webhook with id ${webhookId}`, flags: MessageFlages.Ephemeral });
  }

  await interaction.reply(`Successful ${action.toUpperCase()} for Webhook ${webhookId}`);
}

export default { data, execute };