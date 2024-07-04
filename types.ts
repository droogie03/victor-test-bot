import { CacheType, CommandInteraction, Interaction } from "discord.js";

export type DeployCommandsProps = {
  guildId: string;
};

export type InteractionPlay = Interaction<CacheType> & CommandInteraction;
