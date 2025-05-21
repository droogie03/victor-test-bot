import dotenv from "dotenv";

dotenv.config({ path: [".env", ".env.local"] });

const { APP_ID, DISCORD_TOKEN, PUBLIC_KEY, GUILD_ID, BOT_TELEGRAM_TOKEN, CHANNEL_ID } = process.env;

if (!DISCORD_TOKEN || !APP_ID || !PUBLIC_KEY || !GUILD_ID  || !BOT_TELEGRAM_TOKEN || !CHANNEL_ID) {
  throw new Error("Missing environment variables");
}

export const config = {
  APP_ID,
  DISCORD_TOKEN,
  PUBLIC_KEY,
  GUILD_ID,
  BOT_TELEGRAM_TOKEN,
  CHANNEL_ID,
};
