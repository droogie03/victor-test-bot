import { AudioPlayer } from "@discordjs/voice";
import { QueueFunctions } from "./types";

export const useQueue = (): QueueFunctions => {
  const clientQueue = new Map<string, Map<number, AudioPlayer>>();

  const addClientQueue = (idClient: string, videoFormat: AudioPlayer): void => {
    const formatVideos =
      clientQueue.get(idClient) ?? new Map<number, AudioPlayer>();
    const idVideo: number = Date.now();
    if (formatVideos && formatVideos.get(idVideo)) return;
    formatVideos.set(idVideo, videoFormat);
    clientQueue.set(idClient, formatVideos);
  };

  const getMusicPlayer = (idClient: string, videoid: number): AudioPlayer => {
    const players = clientQueue.get(idClient);
    return players.get(videoid);
  };

  const nextSong = (idClient: string): void => {
    const players = clientQueue.get(idClient);
    if (!players?.size ?? 0) return;
    players.delete(Array.from(players.keys())[0]);
    clientQueue.set(idClient, players);
  };

  const currentSong = (idClient: string): number | null => {
    const players = clientQueue.get(idClient);
    if (!players?.size ?? 0) return null;
    return Array.from(players.keys())[0];
  };

  return { getMusicPlayer, nextSong, currentSong, addClientQueue };
};
