// Icons for the social links in the footer (edited in Keystatic under Pages → "Social media links").
// Brand icons come from Simple Icons (free to use); Email and Website use simple outline drawings.
import {
  siApplepodcasts, siBluesky, siFacebook, siInstagram, siPinterest, siSpotify, siStrava, siSubstack,
  siThreads, siTiktok, siWhatsapp, siX, siYoutube,
} from 'simple-icons';
import { LINKEDIN_PATH } from './share';

export type SocialIcon = { label: string; path?: string; viewBox?: string; outline?: boolean; letters?: string };

const brand = (label: string, icon: { path: string }): SocialIcon => ({ label, path: icon.path });

export const SOCIAL_PLATFORMS = {
  instagram: brand('Instagram', siInstagram),
  youtube: brand('YouTube', siYoutube),
  tiktok: brand('TikTok', siTiktok),
  facebook: brand('Facebook', siFacebook),
  x: brand('X', siX),
  threads: brand('Threads', siThreads),
  bluesky: brand('Bluesky', siBluesky),
  pinterest: brand('Pinterest', siPinterest),
  // LinkedIn isn't in Simple Icons, so its genuine logo comes from Bootstrap Icons (MIT).
  linkedin: { label: 'LinkedIn', path: LINKEDIN_PATH, viewBox: '0 0 16 16' },
  spotify: brand('Spotify', siSpotify),
  applepodcasts: brand('Apple Podcasts', siApplepodcasts),
  substack: brand('Substack', siSubstack),
  whatsapp: brand('WhatsApp', siWhatsapp),
  strava: brand('Strava', siStrava),
  email: { label: 'Email', outline: true, path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
  website: { label: 'Website', outline: true, path: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
} satisfies Record<string, SocialIcon>;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;
export const SOCIAL_PLATFORM_IDS = Object.keys(SOCIAL_PLATFORMS) as [SocialPlatform, ...SocialPlatform[]];
