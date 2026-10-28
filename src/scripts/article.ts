// Interactive behaviour for the article page.
// Likes and comments are saved in the site's database through /api/likes and /api/comments.

type Comment = { id: number; name: string; initials: string; text: string; createdAt: string; isAuthor: boolean; replies: Comment[] };

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];

// A random id for this browser, so each visitor's like counts once. Not linked to who they are.
// It's only created when the visitor taps Like (nothing is stored for people who just read).
let pageVisitor = '';
function visitorId(create: boolean): string {
  try {
    let id = localStorage.getItem('lll-visitor') ?? '';
    if (!id && create) localStorage.setItem('lll-visitor', (id = crypto.randomUUID()));
    return id;
  } catch {
    return create ? (pageVisitor ||= crypto.randomUUID()) : pageVisitor; // storage blocked: likes still work for this page view
  }
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, body === undefined ? undefined : {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}

/** "Just now", "5 minutes ago", "2 days ago", then the date. */
function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const ago = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
  if (s < 60) return 'Just now';
  if (s < 3600) return ago(Math.floor(s / 60), 'minute');
  if (s < 86400) return ago(Math.floor(s / 3600), 'hour');
  if (s < 86400 * 30) return ago(Math.floor(s / 86400), 'day');
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function initArticle() {
  const meta = JSON.parse($('#post-meta')!.textContent!) as { id: string; title: string };

  // Scroll progress through #article-body
  const bar = $('[data-progress]')!;
  const body = $('#article-body')!;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (-rect.top / total) * 100)) : 0;
      bar.style.width = pct + '%';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-reveal zoom (fires once per image). A photo zooms only once (nearly) all of it is on screen,
  // so the reader sees the whole effect. Nothing zooms until the reader first scrolls, so photos already
  // on screen when the page opens (like the top photo) zoom on that first scroll, not on load.
  const inView = new Set<Element>();
  let scrolled = false;
  const reveal = (el: Element) => {
    el.classList.add('is-visible');
    io.unobserve(el);
    inView.delete(el);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // "Fully in view": 90% of the photo, or 90% of the screen for photos taller than the screen.
        const shown = e.intersectionRect.height;
        const full = shown >= 0.9 * Math.min(e.boundingClientRect.height, window.innerHeight);
        if (!e.isIntersecting || !full) inView.delete(e.target);
        else if (scrolled) reveal(e.target);
        else inView.add(e.target);
      }
    },
    { threshold: [0, 0.25, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1] },
  );
  $$('.reveal').forEach((el) => io.observe(el));
  const onFirstScroll = () => {
    // Ignore the browser restoring the scroll position on reload; wait for the reader to move.
    if (scrolled) return;
    scrolled = true;
    window.removeEventListener('scroll', onFirstScroll);
    [...inView].forEach(reveal);
  };
  const listen = () => setTimeout(() => window.addEventListener('scroll', onFirstScroll, { passive: true }), 100);
  if (document.readyState === 'complete') listen();
  else window.addEventListener('load', listen);

  // Table of contents
  const toc = $('[data-toc]')!;
  const tocBtn = $('[data-toc-toggle]')!;
  const setToc = (open: boolean) => {
    toc.hidden = !open;
    tocBtn.setAttribute('aria-expanded', String(open));
    $('[data-toc-glyph]')!.textContent = open ? '−' : '+';
  };
  tocBtn.addEventListener('click', () => setToc(toc.hidden));
  $$<HTMLAnchorElement>('[data-toc-link]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToId(a.hash.slice(1));
      setToc(false);
    }),
  );

  // Likes
  const post = encodeURIComponent(meta.id);
  let like = { count: 0, liked: false };
  const renderLike = () => {
    $$('[data-like]').forEach((b) => b.classList.toggle('liked', like.liked));
    $$('[data-like]').forEach((b) => b.setAttribute('aria-pressed', String(like.liked)));
    $$('[data-like-count]').forEach((c) => (c.textContent = String(like.count)));
  };
  $$('[data-like]').forEach((b) =>
    b.addEventListener('click', async () => {
      const before = like;
      like = { liked: !like.liked, count: Math.max(0, like.count + (like.liked ? -1 : 1)) }; // show it straight away
      renderLike();
      try {
        like = await api('/api/likes', { post: meta.id, visitor: visitorId(true), liked: like.liked });
      } catch {
        like = before;
      }
      renderLike();
    }),
  );
  renderLike();
  api<typeof like>(`/api/likes?post=${post}&visitor=${visitorId(false)}`).then((l) => ((like = l), renderLike())).catch(() => {});

  $$('[data-to-comments]').forEach((b) => b.addEventListener('click', () => scrollToId('comments-section')));

  // Share sheet
  const share = $('[data-share]')!;
  const url = location.href.split('#')[0];
  const enc = encodeURIComponent;
  const links: Record<string, string> = {
    email: `mailto:?subject=${enc(meta.title)}&body=${enc(url)}`,
    whatsapp: `https://wa.me/?text=${enc(meta.title + ' ' + url)}`,
    x: `https://x.com/intent/post?text=${enc(meta.title)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    snapchat: `https://www.snapchat.com/scan?attachmentUrl=${enc(url)}`,
  };
  $$<HTMLAnchorElement>('[data-share-link]').forEach((a) => (a.href = links[a.dataset.shareLink!]));
  $$('[data-share-open]').forEach((b) => b.addEventListener('click', () => (share.hidden = false)));
  share.addEventListener('click', (e) => {
    if (e.target === share || (e.target as Element).closest('a')) share.hidden = true;
  });
  // Instagram has no web share URL, so it copies the link too.
  $$('[data-copy]').forEach((b) =>
    b.addEventListener('click', () => {
      navigator.clipboard?.writeText(url).catch(() => {});
      const label = $('[data-copy-label]')!;
      label.textContent = 'Copied!';
      setTimeout(() => (share.hidden = true), 600);
      setTimeout(() => (label.textContent = 'Copy link'), 2000);
    }),
  );

  // Comments
  let comments: Comment[] = [];
  const list = $('[data-comments]')!;
  const notice = $('[data-comment-notice]')!;
  const say = (msg: string, error = false) => {
    notice.textContent = msg;
    notice.classList.toggle('error', error);
    notice.hidden = !msg;
  };
  const item = (c: Comment, reply = false) => `
    <div class="c${reply ? ' reply' : ''}${c.isAuthor ? ' author' : ''}">
      <div class="c-av">${escapeHtml(c.initials)}</div>
      <div class="c-body">
        <div class="c-head"><span class="c-name">${escapeHtml(c.name)}</span>${c.isAuthor ? '<span class="c-badge">Author</span>' : ''}<span class="c-time">${escapeHtml(timeAgo(c.createdAt))}</span></div>
        <p class="c-text">${escapeHtml(c.text)}</p>
      </div>
    </div>`;
  const renderComments = () => {
    list.innerHTML = comments.length
      ? comments.map((c) => `<div>${item(c)}${c.replies.map((r) => item(r, true)).join('')}</div>`).join('')
      : '<p class="c-empty">No comments yet. Be the first to share your thoughts.</p>';
    $$('[data-comment-count]').forEach((n) => (n.textContent = String(comments.length)));
  };
  renderComments();
  api<{ comments: Comment[] }>(`/api/comments?post=${post}`)
    .then((r) => ((comments = r.comments), renderComments()))
    .catch(() => say('Comments couldn’t be loaded just now. Please refresh to try again.', true));

  const form = $<HTMLFormElement>('[data-comment-form]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.name?.trim() || !data.text?.trim()) return say('Please add your name and a comment.', true);
    const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.disabled = true;
    try {
      const r = await api<{ status: string; comment: Comment | null }>('/api/comments', { ...data, post: meta.id });
      form.reset();
      if (r.status === 'pending') say('Thanks! Your comment will appear once Ben has approved it.');
      else {
        say('');
        if (r.comment) comments = [r.comment, ...comments];
        renderComments();
      }
    } catch (err) {
      say((err as Error).message, true);
    } finally {
      button.disabled = false;
    }
  });
}
