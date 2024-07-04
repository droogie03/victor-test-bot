import { SlashCommandBuilder } from "discord.js";
import { InteractionPlay } from "../../types";
import { QueueFunctions } from "../hooks/types";
import { VoiceConnection } from "@discordjs/voice";
import { connectVoiceChannel } from "../services/services";

export const data = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("resume song!");

export async function execute(
  interaction: InteractionPlay,
  queueService: QueueFunctions
) {
  const { currentSong, getMusicPlayer } = queueService;
  try {
    const videoId: number | null = currentSong(interaction.channelId);

    if (!videoId) {
      await interaction.reply("No hay cancion puesta pelotudo.");
      return;
    }

    const player = getMusicPlayer(interaction.channelId, videoId);
    player.unpause();
    const connection: VoiceConnection = await connectVoiceChannel(interaction);

    connection.subscribe(player);

    await interaction.reply("Volvemos a escucharlo capo.");
  } catch (error) {
    console.log(error);
    await interaction.reply(
      "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
    );
  }
}
