import { AudioPlayer } from "@discordjs/voice";

export type QueueFunctions = {
  getMusicPlayer: (idClient: string, videoId: number) => AudioPlayer;
  nextSong: (idClient: string) => void;
  currentSong: (idClient: string) => number | null;
  addClientQueue: (idClient: string, videoFormat: AudioPlayer) => void;
};
