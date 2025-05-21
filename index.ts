import { Client, Events, GatewayIntentBits } from "discord.js";
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

const CHAT_IDS = ["117459607"];
const queueService: QueueFunctions = useQueue();

const player = new Player(client, {
  ytdlOptions: { quality: "highestaudio", highWaterMark: 1 << 25 },
});
player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");

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
    const url = `https://api.telegram.org/bot${config.BOT_TELEGRAM_TOKEN}/sendMessage`;
    for (const chatId of CHAT_IDS) {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.content,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("Mensaje enviado a Telegram");
        })
        .catch((err) => {
          console.error("Error al enviar a Telegram:", err.response.data);
        });
    }
  }
  console.log("message", message.content);
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
