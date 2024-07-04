import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { InteractionPlay } from "../../types";
import { connectVoiceChannel } from "../services/services";
import { VoiceConnection } from "@discordjs/voice";
import { useMainPlayer } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("play anything you want!");

export async function execute(interaction: InteractionPlay) {
  try {
    const connection: VoiceConnection = await connectVoiceChannel(interaction);
    connection.destroy();
    await interaction.reply("Ale majo, hasta luego.");
  } catch (error) {
    console.log(error);
    await interaction.reply("ya esta parado pelotudo de meirda.");
  }
}
