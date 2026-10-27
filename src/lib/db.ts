// Comments and likes database (Cloudflare D1, which is SQLite).
// Tables are created automatically: each migration below runs once, in order, the first time
// the site talks to the database. To change the tables, ADD a new migration; never edit an old one.

export interface D1Result<T = Record<string, unknown>> { results: T[] }
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

const NOW = "strftime('%Y-%m-%dT%H:%M:%SZ','now')";

const MIGRATIONS: { id: number; statements: string[] }[] = [
  {
    id: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post TEXT NOT NULL,
        parent_id INTEGER REFERENCES comments(id),
        name TEXT NOT NULL,
        email TEXT,
        text TEXT NOT NULL,
        is_author INTEGER NOT NULL DEFAULT 0,
        notify_replies INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'published', -- published | pending | deleted
        created_at TEXT NOT NULL DEFAULT (${NOW})
      )`,
      `CREATE INDEX IF NOT EXISTS comments_by_post ON comments (post, status, created_at)`,
      `CREATE TABLE IF NOT EXISTS likes (
        post TEXT NOT NULL,
        visitor TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (${NOW}),
        PRIMARY KEY (post, visitor)
      )`,
    ],
  },
];

let ready: Promise<void> | undefined;

export function ensureSchema(db: D1Database): Promise<void> {
  ready ??= (async () => {
    await db.prepare(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (${NOW}))`).run();
    const done = new Set((await db.prepare('SELECT id FROM _migrations').all<{ id: number }>()).results.map((r) => r.id));
    for (const m of MIGRATIONS) {
      if (done.has(m.id)) continue;
      await db.batch([
        ...m.statements.map((sql) => db.prepare(sql)),
        db.prepare('INSERT OR IGNORE INTO _migrations (id) VALUES (?)').bind(m.id),
      ]);
    }
  })().catch((e) => {
    ready = undefined; // try again on the next request
    throw e;
  });
  return ready;
}

export type CommentRow = {
  id: number; post: string; parent_id: number | null; name: string; email: string | null; text: string;
  is_author: number; notify_replies: number; status: string; created_at: string;
};

export type PublicComment = {
  id: number; name: string; initials: string; text: string; createdAt: string; isAuthor: boolean;
  replies: PublicComment[];
};

const toPublic = (r: CommentRow): PublicComment => ({
  id: r.id, name: r.name, initials: r.name.trim().charAt(0).toUpperCase(), text: r.text,
  createdAt: r.created_at, isAuthor: !!r.is_author, replies: [],
});

/** Nest replies under their parent comment; newest top-level comments first, replies oldest first. */
export function thread(rows: CommentRow[]): PublicComment[] {
  const top = rows.filter((r) => !r.parent_id).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id).map(toPublic);
  const byId = new Map(top.map((c) => [c.id, c]));
  rows.filter((r) => r.parent_id).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
    .forEach((r) => byId.get(r.parent_id!)?.replies.push(toPublic(r)));
  return top;
}
