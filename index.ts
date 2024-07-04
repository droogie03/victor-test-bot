import {
  CacheType,
  Client,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  Interaction,
  MessageInteraction,
} from "discord.js";
import { Player } from "discord-player";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";
import { InteractionPlay } from "./types";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

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

client.on(Events.InteractionCreate, async (interaction: InteractionPlay) => {
  try {
    if (!interaction.isCommand()) {
      return;
    }
    const { commandName } = interaction;

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(config.DISCORD_TOKEN);
