import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { InteractionPlay } from "../../types";
import { GuildMember } from "discord.js";

import { CacheType, CommandInteraction, Interaction } from "discord.js";
import ytdl from "@distube/ytdl-core";

import { FORMAT_OPTIONS, FORMAT_RESPONSE } from "../constants";
import { CustomFormat } from "./types";

export const connectVoiceChannel = async (
  interaction: InteractionPlay
): Promise<VoiceConnection> => {
  const { member, guild } = interaction;

  if (member instanceof GuildMember && member.voice.channel.id) {
    return joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
  }
  throw new Error("Connect to a voice channel please.");
};

export const getFormat = async (
  interaction: Interaction<CacheType> & CommandInteraction,
  url: string,
  type: "audio" | "video"
): Promise<CustomFormat> => {
  try {
    if (ytdl.validateURL(url)) {
      const videoID: string = ytdl.getVideoID(url);
      const info: ytdl.videoInfo = await ytdl.getInfo(videoID);
      const formats: ytdl.videoFormat[] = FORMAT_OPTIONS[type](info);
      return {
        format: FORMAT_RESPONSE[type](formats),
        info,
      };
    }
  } catch (error) {
    console.error(error);
    await interaction.reply("Pero manda un enlace del youtube.");
    throw error;
  }
};
