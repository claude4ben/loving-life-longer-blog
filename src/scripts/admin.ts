// Comment admin: sign in, list every comment, reply as Ben, delete, restore, approve.

type Row = {
  id: number; post: string; parent_id: number | null; name: string; email: string | null; text: string;
  is_author: number; status: 'published' | 'pending' | 'deleted'; created_at: string;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export function initAdmin() {
  const list = document.querySelector<HTMLElement>('[data-list]')!;
  const msg = document.querySelector<HTMLElement>('[data-msg]')!;
  const showDeleted = document.querySelector<HTMLInputElement>('[data-show-deleted]')!;
  const login = document.querySelector<HTMLFormElement>('[data-login]')!;
  const panel = document.querySelector<HTMLElement>('[data-admin]')!;
  let rows: Row[] = [];

  const say = (text: string, error = false) => {
    msg.textContent = text;
    msg.classList.toggle('error', error);
  };

  const card = (r: Row) => `
    <div class="a-card${r.parent_id ? ' reply' : ''}${r.status === 'deleted' ? ' deleted' : ''}" data-id="${r.id}">
      <div class="a-head">
        <span class="a-name">${esc(r.name)}</span>
        ${r.email ? `<span>${esc(r.email)}</span>` : ''}
        <span>${esc(when(r.created_at))}</span>
        ${r.status !== 'published' ? `<span class="a-status ${r.status}">${r.status === 'pending' ? 'Waiting for approval' : 'Deleted'}</span>` : ''}
      </div>
      <p class="a-text">${esc(r.text)}</p>
      <div class="a-actions">
        ${r.status === 'pending' ? '<button data-act="approve">Approve</button>' : ''}
        ${r.status !== 'deleted' ? '<button data-act="open-reply">Reply</button><button class="danger" data-act="delete">Delete</button>' : '<button data-act="restore">Restore</button>'}
      </div>
      <form class="a-reply" hidden>
        <textarea class="field" name="text" rows="3" placeholder="Your reply (shown as Ben)" aria-label="Your reply"></textarea>
        <div><button class="btn" type="submit">Post reply</button></div>
      </form>
    </div>`;

  const render = () => {
    const visible = rows.filter((r) => showDeleted.checked || r.status !== 'deleted');
    const top = visible.filter((r) => !r.parent_id);
    const posts = [...new Set(top.map((r) => r.post))];
    list.innerHTML = posts
      .map((post) => `<div class="a-post">${esc(post)}</div>` + top.filter((r) => r.post === post).map((r) =>
        card(r) + visible.filter((x) => x.parent_id === r.id).reverse().map(card).join('')).join(''))
      .join('');
    const pending = rows.filter((r) => r.status === 'pending').length;
    say(top.length ? (pending ? `${pending} waiting for approval.` : '') : 'No comments yet.');
  };

  const showLogin = (message = '') => {
    panel.hidden = true;
    login.hidden = false;
    say(message, !!message);
    login.querySelector('input')!.focus();
  };

  const load = async () => {
    try {
      const res = await fetch('/api/admin/comments');
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) return showLogin();
      if (!res.ok) throw new Error(data.error || 'Couldn’t load comments.');
      login.hidden = true;
      panel.hidden = false;
      rows = data.comments;
      render();
    } catch (e) {
      list.innerHTML = '';
      say((e as Error).message, true);
    }
  };

  const act = async (id: number, action: string, text?: string) => {
    const res = await fetch('/api/admin/comments', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, action, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return showLogin('You’ve been signed out. Please sign in again.');
    if (!res.ok) return say(data.error || 'That didn’t work. Please try again.', true);
    await load();
  };

  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = (login.querySelector('input') as HTMLInputElement).value;
    const res = await fetch('/api/admin/session', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return say(data.error || 'Sign-in failed. Please try again.', true);
    login.reset();
    // Came here from another admin page (e.g. photo crops)? Go back there.
    const next = new URLSearchParams(location.search).get('next');
    if (next && /^\/admin\/[\w/-]*$/.test(next)) return location.assign(next);
    await load();
  });

  document.querySelector('[data-signout]')!.addEventListener('click', async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    list.innerHTML = '';
    showLogin();
  });

  list.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-act]');
    if (!btn) return;
    const cardEl = btn.closest<HTMLElement>('.a-card')!;
    const id = Number(cardEl.dataset.id);
    const action = btn.dataset.act!;
    if (action === 'open-reply') {
      const f = cardEl.querySelector<HTMLFormElement>('.a-reply')!;
      f.hidden = !f.hidden;
      f.querySelector('textarea')!.focus();
    } else if (action !== 'delete' || confirm('Delete this comment? You can restore it later.')) {
      act(id, action);
    }
  });
  list.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const text = (f.querySelector('textarea') as HTMLTextAreaElement).value.trim();
    if (text) act(Number(f.closest<HTMLElement>('.a-card')!.dataset.id), 'reply', text);
  });
  showDeleted.addEventListener('change', render);
  document.querySelector('[data-refresh]')!.addEventListener('click', load);
  load();
}
