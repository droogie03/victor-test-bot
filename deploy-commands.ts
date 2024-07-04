import "dotenv/config";
import { commands } from "./commands";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config";
import { DeployCommandsProps } from "./types";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(config.APP_ID, guildId), {
      body: commandsData,
    });

    console.log("Successfully reloaded application (/) commands.");
    return;
  } catch (error) {
    console.error(error);
  }
}

deployCommands({ guildId: config.GUILD_ID });
