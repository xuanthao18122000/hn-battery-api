import { getEnv } from './env.config';

export interface DiscordConfig {
  token: string;
  clientId: string;
  guildId: string;
}

export const discordConfig = {
  token: getEnv<string>('DISCORD_BOT_TOKEN'),
  clientId: getEnv<string>('DISCORD_CLIENT_ID'),
  guildId: getEnv<string>('DISCORD_GUILD_ID'),
} as const;

export const DISCORD_CHANNELS = {
  ERROR_LOGS: getEnv<string>('DISCORD_ERROR_CHANNEL_ID'),
  WITHDRAWAL_LOGS: getEnv<string>('DISCORD_WITHDRAWAL_CHANNEL_ID'),
} as const;

export const DISCORD_COLORS = {
  SUCCESS: '#00ff00',
  ERROR: '#ff0000',
  WARNING: '#ffff00',
  INFO: '#0099ff',
} as const;

export const DISCORD_EMOJIS = {
  SUCCESS: '✅',
  ERROR: '🚨',
  WARNING: '⚠️',
  INFO: 'ℹ️',
} as const;
