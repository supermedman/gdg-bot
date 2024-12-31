import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Replies with information about the user.');

async function execute(interaction) {
  await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
}

export default { data, execute };
