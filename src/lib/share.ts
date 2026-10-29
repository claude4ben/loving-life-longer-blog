// The share sheet's options, with genuine brand icons in brand colours. Brand icons come from Simple Icons
// (free to use); LinkedIn's comes from Bootstrap Icons (MIT), as Simple Icons doesn't include it.
// The web addresses each option opens are filled in by src/scripts/article.ts.
import {
  siBluesky, siFacebook, siInstagram, siMessenger, siPinterest, siReddit, siSnapchat, siTelegram, siThreads,
  siWhatsapp, siX,
} from 'simple-icons';

export const LINKEDIN_PATH =
  'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z';

export type ShareOption = {
  id: string;
  label: string;
  path: string;
  viewBox?: string; // default 0 0 24 24
  bg: string; // tile colour
  fg?: string; // icon colour (default white)
  outline?: boolean; // drawn icon (not a brand logo)
  copy?: boolean; // copies the link instead of opening a page (Instagram has no web share)
  phonesOnly?: boolean; // only works with an app installed on a phone
};

const brand = (id: string, label: string, icon: { path: string; hex: string }, extra: Partial<ShareOption> = {}): ShareOption => ({
  id, label, path: icon.path, bg: `#${icon.hex}`, ...extra,
});

export const SHARE_OPTIONS: ShareOption[] = [
  brand('whatsapp', 'WhatsApp', siWhatsapp),
  brand('facebook', 'Facebook', siFacebook),
  brand('x', 'X', siX),
  { id: 'linkedin', label: 'LinkedIn', path: LINKEDIN_PATH, viewBox: '0 0 16 16', bg: '#0A66C2' },
  brand('messenger', 'Messenger', siMessenger, { phonesOnly: true }),
  {
    id: 'sms', label: 'Messages', bg: '#34C759', outline: true, phonesOnly: true,
    path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  },
  {
    id: 'email', label: 'Email', bg: '#5F6368', outline: true,
    path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  },
  brand('instagram', 'Instagram', siInstagram, { copy: true }),
  brand('threads', 'Threads', siThreads),
  brand('bluesky', 'Bluesky', siBluesky),
  brand('reddit', 'Reddit', siReddit),
  brand('pinterest', 'Pinterest', siPinterest),
  brand('telegram', 'Telegram', siTelegram),
  brand('snapchat', 'Snapchat', siSnapchat, { fg: '#000000' }),
];
