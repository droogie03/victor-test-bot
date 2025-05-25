import { Channel, Client, Events, GatewayIntentBits } from "discord.js";
import { Player } from "discord-player";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";
import { InteractionPlay } from "./types";
import { useQueue } from "./commands/hooks/useQueue";
import { QueueFunctions } from "./commands/hooks/types";
import { createMessage } from "./utils";
import { sendMessageTelegram } from "./telegram";
import { Telegraf } from "telegraf";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const bot = new Telegraf(config.BOT_TELEGRAM_TOKEN);

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
    let sendMessage = "";
    let region = null;
    let location = null;
    let monsterName = null;
    if (message.embeds.length > 0) {
      const embed = message.embeds[0];
      sendMessage = embed.fields.map((f) => `${f.name}: ${f.value}`).join("\n");
      for (const field of embed.fields) {
        if (field.name?.toLowerCase().includes("region")) region = field.value?.toLowerCase();
        if (field.name?.toLowerCase().includes("location"))
          location = field.value;
        if (field.name?.toLowerCase().includes("monster name"))
          monsterName = field.value;
      }
    }
    const messageTelegram = await createMessage(monsterName, region, location);
    try {
      await sendMessageTelegram(messageTelegram);
    } catch (error) {
      console.error("Error al enviar el mensaje a Telegram:", error);
      await createMessage('missigno', 'kanto', 'any')
    }
  }
});

client.on(Events.InteractionCreate, async (interaction: InteractionPlay) => {
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

// Telegram bot

bot.on("text", async (ctx) => {
  const texto = ctx.message.text;
  console.log("Texto recibido:", texto);
  // Solo responde si lo mencionan
  if (!texto.includes(`@${config.BOT_USERNAME}`)) return;

  const prompt = ` ${texto.replace(`@${config.BOT_USERNAME}`, "").trim()}`;

  try {
    const completion: any = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.IA_TOKEN}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://t.me/" + config.BOT_USERNAME,
          "X-Title": "TelegramBot",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente de Pokemmo y quiero que contestes SOLO con la pagina https://pokemmo.shoutwiki.com/ poniendo solo la informacion que encuentres aqui y pones la pagina exacta donde esta esa informacion.Si te preguntan por un pokemon buscalo en la parte de pokedex y pon exactamente lo que pone ahi en relacion a lo que te han preguntado, si es sobre alguna ruta o zona buscalo en Locations y si es sobre entrenadores en NPCs. ",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      }
    ).then((res) => res.json());
    const respuesta = completion.choices[0].message.content;
    ctx.reply(respuesta);
  } catch (err) {
    console.error("Error al llamar a OpenRouter:", err.message);
    ctx.reply("Hubo un error procesando tu pregunta.");
  }
});

client.login(config.DISCORD_TOKEN);
bot.launch();
