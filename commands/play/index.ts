import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import {
  AudioPlayer,
  AudioResource,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { createWriteStream, WriteStream, unlinkSync } from "fs";
import ytdl from "@distube/ytdl-core";
import { InteractionPlay } from "../../types";
import { OPTION_URL } from "../constants";
import { connectVoiceChannel, getFormat } from "../services/services";
import { QueueFunctions } from "../hooks/types";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("play anything you want!")
  .addStringOption((option: SlashCommandStringOption) =>
    option.setName(OPTION_URL).setDescription("youtube url to play.")
  );

export async function execute(
  interaction: InteractionPlay,
  queueService: QueueFunctions
) {
  const { options } = interaction;
  const { addClientQueue, currentSong } = queueService;

  const url: string = options.get(OPTION_URL)?.value?.toString() ?? "";
  if (!url) {
    await interaction.reply("Manda un enlace pelotudo.");
    return;
  }

  try {
    const player: AudioPlayer = createAudioPlayer();
    const connection: VoiceConnection = await connectVoiceChannel(interaction);

    const { format, info } = await getFormat(interaction, url, "audio");
    const fileName: string = `${info.videoDetails.title}.mp3`;

    const read: WriteStream = ytdl
      .downloadFromInfo(info, { format })
      .pipe(createWriteStream(fileName));

    read.on("finish", async () => {
      const resource: AudioResource<null> = createAudioResource(fileName);
      player.play(resource);

      const currentVideoId: number | null = currentSong(interaction.channelId);
      addClientQueue(interaction.channelId, player);
      if (!currentVideoId) {
        await interaction.reply(`Ahi te pongo ${info.videoDetails.title}.`);
        connection.subscribe(player);
      } else {
        await interaction.reply("Cancion añadida a la lista :).");
      }
      unlinkSync(fileName);
    });
  } catch (error) {
    console.log(error);
    await interaction.reply(
      "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
    );
  }
}
