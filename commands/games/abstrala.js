import "dotenv/config";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const { ITCH_IO_URL_ABSTRALA } = process.env;

const data = new SlashCommandBuilder()
  .setName('abstrala')
  .setDescription("Provides information about Abstrala (jaogwal's game)!");

async function execute(interaction) {
  const data = await fetch(ITCH_IO_URL_ABSTRALA);
  const json = await data.json();
  const embed = createEmbed(json);

  await interaction.reply({ embeds: [embed] });
}

function createEmbed(json) {
  const { tags, title, links, authors, cover_image } = json;
  const author = authors[0];

  return new EmbedBuilder()
    .setTitle(title)
    .setURL(links.self)
    .setAuthor({
      name: author.name,
      iconURL: 'https://cdn.discordapp.com/avatars/1031562510941311121/e5aa476384d05150187b2cfe3da2228b.webp?size=32',
      url: author.url
    })
    .setDescription('3D space flyer chasing targets through a randomized colorscape')
    .addFields(
      { name: '\u200B', value: `[View Comments](${links.comments})`, inline: true },
      { name: '\u200B', value: `[View DevLog](${links.devlog})`, inline: true }
    )
    .setImage(cover_image)
    .setFooter({ text: `Tags: ${tags.join(", ")}` });
}

export default { data, execute };
