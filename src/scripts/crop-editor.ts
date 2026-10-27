// Photo crop editor: drag a frame (or the dot on the original) to move the focus point, use the slider to
// zoom, and every frame for that photo updates live. Save sends the changes per Markdown file.

type State = { x: number; y: number; zoom: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export function initCropEditor() {
  const shots = [...document.querySelectorAll<HTMLElement>('[data-shot]')];
  const savebar = document.querySelector<HTMLElement>('[data-savebar]')!;
  const count = savebar.querySelector<HTMLElement>('[data-count]')!;
  const saveBtn = savebar.querySelector<HTMLButtonElement>('[data-save]')!;

  const editors = shots.map((el) => {
    const saved: State = { x: +el.dataset.x!, y: +el.dataset.y!, zoom: +el.dataset.zoom! };
    let now: State = { ...saved };
    const original = el.querySelector<HTMLElement>('[data-original]')!;
    const dot = el.querySelector<HTMLElement>('[data-dot]')!;
    const zoomInput = el.querySelector<HTMLInputElement>('[data-zoom-input]')!;
    const zoomValue = el.querySelector<HTMLElement>('[data-zoom-value]')!;
    const undo = el.querySelector<HTMLButtonElement>('[data-undo]')!;
    const status = el.querySelector<HTMLElement>('[data-status]')!;
    const imgs = [...el.querySelectorAll<HTMLImageElement>('[data-frame] img')];

    const changed = () => now.x !== saved.x || now.y !== saved.y || now.zoom !== saved.zoom;
    const render = () => {
      const pos = `${now.x}% ${now.y}%`;
      for (const img of imgs) {
        img.style.objectPosition = pos;
        img.style.transformOrigin = pos;
        img.style.setProperty('--zoom', String(now.zoom));
      }
      dot.style.left = `${now.x}%`;
      dot.style.top = `${now.y}%`;
      original.setAttribute('aria-valuetext', `${now.x}% across, ${now.y}% down`);
      zoomInput.value = String(now.zoom);
      zoomValue.textContent = `${now.zoom.toFixed(2)}×`;
      el.classList.toggle('changed', changed());
      undo.disabled = !changed();
      updateBar();
    };
    const set = (next: Partial<State>) => {
      now = { x: round1(clamp(next.x ?? now.x, 0, 100)), y: round1(clamp(next.y ?? now.y, 0, 100)), zoom: clamp(next.zoom ?? now.zoom, 1, 3) };
      status.textContent = '';
      render();
    };

    // The original photo: click or drag to put the focus point there; arrow keys nudge it.
    const fromPointer = (e: PointerEvent) => {
      const r = original.getBoundingClientRect();
      set({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    };
    original.addEventListener('pointerdown', (e) => {
      original.setPointerCapture(e.pointerId);
      fromPointer(e);
      const move = (ev: PointerEvent) => fromPointer(ev);
      original.addEventListener('pointermove', move);
      original.addEventListener('pointerup', () => original.removeEventListener('pointermove', move), { once: true });
    });
    original.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 5 : 1;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!d) return;
      e.preventDefault();
      set({ x: now.x + d[0], y: now.y + d[1] });
    });

    // Frames: drag the photo around inside the frame, like moving a print behind a mount.
    for (const frame of el.querySelectorAll<HTMLElement>('[data-frame]')) {
      frame.addEventListener('pointerdown', (e) => {
        frame.setPointerCapture(e.pointerId);
        const start = { px: e.clientX, py: e.clientY, x: now.x, y: now.y };
        const r = frame.getBoundingClientRect();
        const move = (ev: PointerEvent) => {
          // Moving the photo right shows more of its left side, so the focus moves left.
          set({ x: start.x - ((ev.clientX - start.px) / r.width) * (100 / now.zoom), y: start.y - ((ev.clientY - start.py) / r.height) * (100 / now.zoom) });
        };
        frame.addEventListener('pointermove', move);
        frame.addEventListener('pointerup', () => frame.removeEventListener('pointermove', move), { once: true });
      });
    }

    zoomInput.addEventListener('input', () => set({ zoom: +zoomInput.value }));
    undo.addEventListener('click', () => set(saved));

    return {
      el, changed,
      change: () => ({ id: el.dataset.id!, focus: `${now.x}% ${now.y}%`, zoom: now.zoom }),
      file: el.dataset.file!,
      markSaved: () => { Object.assign(saved, now); status.classList.remove('error'); status.textContent = 'Saved'; render(); },
      fail: (msg: string) => { status.classList.add('error'); status.textContent = msg; },
    };
  });

  function updateBar() {
    const n = editors?.filter((e) => e.changed()).length ?? 0;
    savebar.hidden = n === 0;
    count.textContent = `${n} photo${n === 1 ? '' : 's'} changed`;
  }

  saveBtn.addEventListener('click', async () => {
    const pending = editors.filter((e) => e.changed());
    const byFile = new Map<string, typeof pending>();
    for (const e of pending) byFile.set(e.file, [...(byFile.get(e.file) ?? []), e]);
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    let ok = 0;
    for (const [file, list] of byFile) {
      try {
        const res = await fetch('/api/admin/photos', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ file, changes: list.map((e) => e.change()) }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error('You’ve been signed out. Please refresh and sign in again.');
        if (!res.ok) throw new Error(data.error || 'Saving failed. Please try again.');
        list.forEach((e) => e.markSaved());
        ok += list.length;
      } catch (err) {
        list.forEach((e) => e.fail((err as Error).message));
      }
    }
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
    updateBar();
    if (ok && savebar.hidden) {
      savebar.hidden = false;
      count.textContent = 'Saved. The site will update in about 2 minutes.';
      saveBtn.hidden = true;
      setTimeout(() => { saveBtn.hidden = false; updateBar(); }, 6000);
    }
  });

  updateBar();
}
