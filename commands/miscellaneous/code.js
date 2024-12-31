import "dotenv/config";
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const { EVAL_WHITELIST } = process.env;
const WHITELIST = EVAL_WHITELIST.split(",");

const data = new SlashCommandBuilder()
  .setName('code')
  .setDescription('Execute JavaScript code.');

async function execute(interaction) {
  if ( ! WHITELIST.includes(interaction.user.id)) {
    return await interaction.reply('You do not have permission to run this command.');
  }

  const modalCode = new ModalBuilder()
    .setCustomId('modal-code')
    .setTitle("Run JavaScript");
  
  const modalFieldInput = new TextInputBuilder()
    .setCustomId('code')
    .setLabel('Enter your code:')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("setResult({ result: 42 });")
    .setRequired(true);

    modalCode.addComponents(new ActionRowBuilder().addComponents(modalFieldInput));

    await interaction.showModal(modalCode);
}

export default { data, execute };
