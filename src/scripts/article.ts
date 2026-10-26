// Interactive behaviour for the article page.
// Likes and comments are stored in this browser only until a backend is added.

type Comment = { id: number; name: string; initials: string; time: string; text: string; replies: Comment[] };

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];

const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function initArticle() {
  const meta = JSON.parse($('#post-meta')!.textContent!) as { id: string; title: string; likes: number };

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

  // Scroll-reveal zoom (fires once per image)
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  $$('.reveal').forEach((el) => io.observe(el));

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
  const likeKey = `lll-liked:${meta.id}`;
  let liked = store.get(likeKey, false);
  const renderLike = () => {
    $$('[data-like]').forEach((b) => b.classList.toggle('liked', liked));
    $$('[data-like-glyph]').forEach((g) => (g.textContent = liked ? '♥' : '♡'));
    $$('[data-like-count]').forEach((c) => (c.textContent = String(meta.likes + (liked ? 1 : 0))));
  };
  $$('[data-like]').forEach((b) =>
    b.addEventListener('click', () => {
      liked = !liked;
      store.set(likeKey, liked);
      renderLike();
    }),
  );
  renderLike();

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
  const seed = JSON.parse($('#seed-comments')!.textContent!) as Comment[];
  const commentsKey = `lll-comments:${meta.id}`;
  let comments: Comment[] = [...store.get<Comment[]>(commentsKey, []), ...seed];
  const list = $('[data-comments]')!;
  const item = (c: Comment, reply = false) => `
    <div class="c${reply ? ' reply' : ''}">
      <div class="c-av">${escapeHtml(c.initials)}</div>
      <div class="c-body">
        <div class="c-head"><span class="c-name">${escapeHtml(c.name)}</span><span class="c-time">${escapeHtml(c.time)}</span></div>
        <p class="c-text">${escapeHtml(c.text)}</p>
      </div>
    </div>`;
  const renderComments = () => {
    list.innerHTML = comments.map((c) => `<div>${item(c)}${c.replies.map((r) => item(r, true)).join('')}</div>`).join('');
    $$('[data-comment-count]').forEach((n) => (n.textContent = String(comments.length)));
  };
  renderComments();

  const form = $<HTMLFormElement>('[data-comment-form]')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const text = String(data.get('text') ?? '').trim();
    if (!name || !text) return;
    const c: Comment = { id: Date.now(), name, initials: name.charAt(0).toUpperCase(), time: 'Just now', text, replies: [] };
    comments = [c, ...comments];
    store.set(commentsKey, [c, ...store.get<Comment[]>(commentsKey, [])]);
    form.reset();
    renderComments();
  });
}
