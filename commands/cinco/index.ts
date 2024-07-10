import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
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
  .setName("cinco")
  .setDescription("te ilustra con una rima más ilustre que Ayuso pero no tan ignorante")
  .addStringOption((option: SlashCommandStringOption) =>
    option.setName("text_disc").setDescription("Métele tremendo tres mas dos, formato texto o numérico")
  );

export async function execute(
  interaction: InteractionPlay,
  queueService: QueueFunctions
) {
  const { options } = interaction;

  const text: string = options.get("text_disc")?.value?.toString() ?? "";
  if (!text) {
    await interaction.reply("Te doy una pista, tres ojos tiene el puente.");
    return;
  }

  try {
    if (text=="5" || text=="cinco")
      {
         
        
        const url: string = "https://www.youtube.com/watch?v=vNVnARRBbtg&ab_channel=lfsoundeffects";
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
            connection.subscribe(player);
            await interaction.reply(`Por el culo te la hinco.`);
            //unlinkSync(fileName);
          });
          player.on(
            "stateChange",
            async (_: AudioPlayerState, newState: AudioPlayerState) => {
              if (newState.status === AudioPlayerStatus.Idle) {
                connection.disconnect();
              }
            }
          );
        } catch (error) {
      
          console.log(error);
          await interaction.reply(
            "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
          );
        }
      }
        
      } catch (error) {
        console.log(error);
        await interaction.reply(
          "A ver, asegurate de estar en un canal de voz y que exista la url imbecil."
        );
      }

  
}
