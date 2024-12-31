import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Replies with information about the server.');

async function execute(interaction) {
  await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
}

export default { data, execute };
