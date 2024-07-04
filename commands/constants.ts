import ytdl from "@distube/ytdl-core";

export const OPTION_URL = "url";

export const FORMAT_OPTIONS: Record<
  "audio" | "video",
  (info: ytdl.videoInfo) => ytdl.videoFormat[]
> = {
  audio: (info: ytdl.videoInfo) =>
    ytdl
      .filterFormats(info.formats, "audioonly")
      .filter((value) => value.audioCodec !== "opus"),
  video: (info: ytdl.videoInfo) =>
    ytdl.filterFormats(info.formats, "video").filter((value) => value.hasAudio),
};

export const FORMAT_RESPONSE: Record<
  "audio" | "video",
  (formats: ytdl.videoFormat[]) => ytdl.videoFormat
> = {
  audio: (formats: ytdl.videoFormat[]) =>
    ytdl.chooseFormat(formats, {
      quality: "highestaudio",
    }),
  video: (formats: ytdl.videoFormat[]) => formats[0],
};
