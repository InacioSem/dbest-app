import type { DistributionChannel } from './types';
import { DownloadChannel } from './download.channel';

const channels = new Map<string, DistributionChannel>();

// Register the default download channel
channels.set('download', new DownloadChannel());

// Future channels will be registered here:
// channels.set('youtube', new YouTubeChannel());
// channels.set('tiktok', new TikTokChannel());
// channels.set('spotify_canvas', new SpotifyCanvasChannel());
// channels.set('instagram', new InstagramChannel());

/**
 * Get all available distribution channels.
 */
export function getAvailableChannels(): DistributionChannel[] {
  return Array.from(channels.values());
}

/**
 * Get a specific distribution channel by ID.
 */
export function getChannel(id: string): DistributionChannel | undefined {
  return channels.get(id);
}

/**
 * Register a new distribution channel.
 */
export function registerChannel(channel: DistributionChannel): void {
  channels.set(channel.id, channel);
}
