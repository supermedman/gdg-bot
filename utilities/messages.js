import fs from "node:fs";

/**@typedef { { id: string, parentid: string, threadid: string } } StoredHook */

/*
  Update Active Hook Storage (CALLED ON ACTIVE HOOK CHANGES)
*/
export async function updateHookFile(client, hookPayload) {
  /**@type { StoredHook[] } */
  const currentHooks = await client.hookLoader.getFileContents();

  const isNewHook = (id) => currentHooks.some( (hook) => hook.id === id);

  /**@type { StoredHook[] } */
  const updatedHooks = (isNewHook(hookPayload.id)) 
  ? currentHooks
  : currentHooks.filter(hook => hook.id !== hookPayload.id);

  updatedHooks.push(hookPayload);

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