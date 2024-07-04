import { SlashCommandBuilder } from "discord.js";
import { InteractionPlay } from "../../types";
import { QueueFunctions } from "../hooks/types";
import { VoiceConnection } from "@discordjs/voice";
import { connectVoiceChannel } from "../services/services";

export const data = new SlashCommandBuilder()
  .setName("next")
  .setDescription("next song!");

export async function execute(
  interaction: InteractionPlay,
  queueService: QueueFunctions
) {
  const { nextSong, currentSong, getMusicPlayer } = queueService;
  try {
    nextSong(interaction.channelId);

    const videoId: number | null = currentSong(interaction.channelId);

    if (!videoId) {
      await interaction.reply(
        "No hay mas canciones añadidas. Si quieres pararlo sal con /stop"
      );
      return;
    }

    const newPlayer = getMusicPlayer(interaction.channelId, videoId);
    const connection: VoiceConnection = await connectVoiceChannel(interaction);

    connection.subscribe(newPlayer);

    await interaction.reply("Si, esta ya aburre, siguiente cancion.");
  } catch (error) {
    console.log(error);
    await interaction.reply(
      "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
    );
  }
}
