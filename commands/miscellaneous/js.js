import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('js')
  .setDescription('Executes JavaScript code.');

async function execute(interaction) {
  await interaction.reply('Not yet implemented!');
}

export default { data, execute };
