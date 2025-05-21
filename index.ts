import { Channel, Client, Events, GatewayIntentBits } from "discord.js";
import { Player } from "discord-player";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";
import { InteractionPlay } from "./types";
import { useQueue } from "./commands/hooks/useQueue";
import { QueueFunctions } from "./commands/hooks/types";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const regionMapUrls = {
  Kanto:
    "https://images.wikidexcdn.net/mwuploads/wikidex/5/5e/latest/20091128122013/Mapa_de_Kanto_en_Rojo_Fuego.png",
  Johto:
    "https://images.wikidexcdn.net/mwuploads/wikidex/4/43/latest/20090920215330/Johto_mapa_juegos.png",
  Hoenn:
    "https://images.wikidexcdn.net/mwuploads/wikidex/1/1c/latest/20141212181244/Mapa_Hoenn_juegos.png",
  Sinnoh:
    "https://images.wikidexcdn.net/mwuploads/wikidex/c/c7/latest/20211208122552/Mapa_Sinnoh_DBPR.png",
  Unova:
    "https://images.wikidexcdn.net/mwuploads/wikidex/d/dd/latest/20120710141029/Teselia2_mapa_juegos.png",
};
const CHAT_IDS = ["117459607", "-901699937"];
const queueService: QueueFunctions = useQueue();

const player = new Player(client, {
  ytdlOptions: { quality: "highestaudio", highWaterMark: 1 << 25 },
});
player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");

const createMessage = (monsterName: string, region: string, route: string) => {
  const pokeImg = `https://img.pokemondb.net/artwork/large/${monsterName.toLowerCase()}.jpg`;
  return [
    {
      type: "photo",
      media: pokeImg,
    },
    {
      type: "photo",
      media: regionMapUrls[region],
      caption: `*¡${monsterName} ha aparecido!*\n📍 Región: ${region}\n🛣️ Ubicación: ${route}`,
      parse_mode: "Markdown",
    },
  ];
};

const sendMessageTelegram = async (media) => {
  const url = `https://api.telegram.org/bot${config.BOT_TELEGRAM_TOKEN}/sendMediaGroup`;
  console.log(media);
  for (const chatId of CHAT_IDS) {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        media: media,
        parse_mode: "Markdown",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Imágenes y mensaje enviados.", res);
      })
      .catch((err) => {
        console.error("Error al enviar a Telegram:", err.response.data);
      });
  }
};
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.GuildCreate, async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on(Events.MessageCreate, async (message) => {
  if (
    message.guildId === config.GUILD_ID &&
    message.channelId === config.CHANNEL_ID
  ) {
    let sendMessage = "";
    let region = null;
    let location = null;
    let monsterName = null;
    if (message.embeds.length > 0) {
      const embed = message.embeds[0];
      sendMessage = embed.fields.map((f) => `${f.name}: ${f.value}`).join("\n");
      for (const field of embed.fields) {
        if (field.name.toLowerCase().includes("region")) region = field.value;
        if (field.name.toLowerCase().includes("location"))
          location = field.value;
        if (field.name.toLowerCase().includes("monster name"))
          monsterName = field.value;
      }
    }
    sendMessageTelegram(createMessage(monsterName, region, location));
  }
});

client.on(Events.InteractionCreate, async (interaction: InteractionPlay) => {
  console.log("interaction", interaction);
  try {
    if (!interaction.isCommand()) {
      return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(
        interaction,
        queueService
      );
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(config.DISCORD_TOKEN);
