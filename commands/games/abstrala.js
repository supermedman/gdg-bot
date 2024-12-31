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

/*
{
  "cover_image": "https://img.itch.zone/aW1nLzE5MTgyNjE4LnBuZw==/315x250%23c/YQVwOX.png",
  "links": {
    "comments": "https://jaogwal.itch.io/abstrala-alpha-demo/comments",
    "self": "https://jaogwal.itch.io/abstrala-alpha-demo",
    "devlog": "https://jaogwal.itch.io/abstrala-alpha-demo/devlog"
  },
  "id": 3152430,
  "tags": [
    "colorful",
    "controller",
    "flying",
    "no-ai",
    "simulation",
    "space"
  ],
  "authors": [
    {
      "name": "jaogwal",
      "url": "https://jaogwal.itch.io"
    }
  ],
  "title": "Abstrala (alpha demo)"
}
*/
function createEmbed(json) {
  const { tags, title, links, authors, cover_image } = json;
  const author = authors[0];

  return new EmbedBuilder()
    // .setColor(0x0099FF)
    .setTitle(title)
    .setURL(links.self)
    .setAuthor({
      name: author.name,
      iconURL: 'https://cdn.discordapp.com/avatars/1031562510941311121/e5aa476384d05150187b2cfe3da2228b.webp?size=32',
      url: author.url
    })
    .setDescription('3D space flyer chasing targets through a randomized colorscape')
    // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
      { name: '\u200B', value: `[View Comments](${links.comments})`, inline: true },
      { name: '\u200B', value: `[View DevLog](${links.devlog})`, inline: true }
    )
    .setImage(cover_image)
    .setFooter({ text: `Tags: ${tags.join(", ")}` });
}

export default { data, execute };
