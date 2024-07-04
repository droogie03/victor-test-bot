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
  ],
});

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

client.login(config.DISCORD_TOKEN);
