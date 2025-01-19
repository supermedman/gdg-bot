import fs from "node:fs";

/**@typedef { { id: string, parentid: string, threadid: string } } StoredHook */

/*
  Update Active Hook Storage (CALLED ON ACTIVE HOOK CHANGES)
*/
/**
 * This function handles performing the needed file read/writes to the webhook json file, using dynamic imports to insure updated data is persisted.
 * This is done to ensure the webhook cache is loaded with the correct data upon application restart/reload
 * 
 * This function also makes sure that the cached data is update relative to the updates being made to the persisted json data.
 * 
 * @param {Client} client Active Client Instance
 * @param {StoredHook} hookPayload Contents of target hook
 * @param {string} action Action being preformed, only checking if `action !== 'remove'`
 */
export async function updateHookFile(client, hookPayload, action) {
  /**@type { StoredHook[] } */
  const currentHooks = await client.hookLoader.getFileContents();

  const isNewHook = (id) => currentHooks.some( (hook) => hook.id === id);

  /**@type { StoredHook[] } */
  const updatedHooks = (isNewHook(hookPayload.id)) 
  ? currentHooks
  : currentHooks.filter( (hook) => hook.id !== hookPayload.id);

  // If user picked to remove, do not add the given payload back into the data list.
  if (action !== 'remove') {
    updatedHooks.push(hookPayload);
    client.activeHooks.set(hookPayload.id, [hookPayload.parentid, hookPayload.threadid]);
  } else {
    client.activeHooks.delete(hookPayload.id);
  }

  /**
   * @see
   * `client.hookloader.filePath` is used to update the location saved to for subsiquent data calls.
   */
  fs.writeFile(client.hookLoader.filePath, JSON.stringify(updatedHooks, null, 4), (e) => {
    if (e) return console.error(e);
    console.log('File write success!');
  });
}

/*
  Handle Active Hook Loading (CALLED ON APP STARTUP)
*/
export async function loadHooks(client) {
  /**@type { StoredHook[] } */
  const currentHooks = await client.hookLoader.getFileContents();

  for (const hook of currentHooks) {
    if ('id' in hook === false || 'parentid' in hook === false || 'threadid' in hook === false) continue;
    client.activeHooks.set(hook.id, [hook.parentid, hook.threadid]);
  }
}

/*
  Handle Message Create
*/
export async function handleMessageCreate(message, client) {
  if ( ! message.webhookId || ! client.activeHooks.has(message.webhookId)) return;
  /*
    Handle Webhook Triggers
  */
  const [parentid, storedThreadId] = client.activeHooks.get(message.webhookId);
  // Fetch the guild from client cache => fetch the parent channel from the guild channel cache
  const parentChannel = await client.guilds.fetch(message.guildid).then(async (g) => await g.channels.fetch(parentid));
  const recievingThread = parentChannel.threads.cache.get(storedThreadId);

  return await recievingThread.send({ embeds: [...message.embeds] });
}