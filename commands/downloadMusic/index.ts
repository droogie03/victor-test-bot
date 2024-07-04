import {
  MessagePayload,
  RawFile,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import ytdl from "@distube/ytdl-core";
import { InteractionPlay } from "../../types";
import { OPTION_URL } from "../constants";
import { getFormat } from "../services/services";

export const data = new SlashCommandBuilder()
  .setName("downloadmp3")
  .setDescription("download anything you want(youtube)!")
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
    const { info } = await getFormat(interaction, url, "audio");

    const fileName: string = `${info.videoDetails.title}.mp3`;

    const file = ytdl(url, {
      quality: "highestaudio",
    });
    await interaction.reply(
      `Ahora te descargo ${info.videoDetails.title} en mp3 compadre.`
    );
    const response: MessagePayload = MessagePayload.create(interaction, "");
    const files: RawFile = await MessagePayload.resolveFile(file);
    files.name = fileName;
    response.files = [files];
    response.body = {
      content: "Aqui tienes tu archivo mp3.",
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
