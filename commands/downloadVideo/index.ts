import {
  MessagePayload,
  RawFile,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
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
import { connectVoiceChannel, getFormat } from "../services/services";
import { OPTION_URL } from "../constants";

export const data = new SlashCommandBuilder()
  .setName("downloadmp4")
  .setDescription("play anything you want!")
  .addStringOption((option: SlashCommandStringOption) =>
    option.setName(OPTION_URL).setDescription("youtube url to play.")
  );

export async function execute(interaction: InteractionPlay) {
  const { options } = interaction;

  const url: string = options.get(OPTION_URL)?.value?.toString() ?? "";
  if (!url) {
    await interaction.reply("Manda un enlace pelotudo.");
    return;
  }

  try {
    const { info } = await getFormat(interaction, url, "video");

    const fileName: string = `${info.videoDetails.title}.mp4`;

    const file = ytdl(url);

    await interaction.reply(
      `Ahora te descargo el video ${info.videoDetails.title} compadre.`
    );
    const response: MessagePayload = MessagePayload.create(interaction, "");
    const files: RawFile = await MessagePayload.resolveFile(file);
    files.name = fileName;
    response.files = [files];
    response.body = {
      content: "Aqui tienes tu archivo mp4.",
    };
    await interaction.followUp(response);
    console.log("archivo borrado, proceso terminado.");
  } catch (error) {
    console.log(error);
    await interaction.reply(
      "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
    );
  }
}
