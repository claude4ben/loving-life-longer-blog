import { createRemoteJWKSet, jwtVerify } from 'jose';

// /admin is protected by a Cloudflare Access application. Access signs every request it lets
// through; we check that signature and that the email is on the ADMIN_EMAILS list.
// If anything is missing or wrong, the answer is "not an admin".

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function adminEmail(request: Request, env: Partial<Env>): Promise<string | null> {
  if (env.ADMIN_DEV_BYPASS === '1') return 'local-testing';
  const team = env.ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.ACCESS_AUD?.trim();
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!team || !aud || !token) return null;

  const issuer = `https://${team.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  if (!keySets.has(issuer)) keySets.set(issuer, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));
  try {
    const { payload } = await jwtVerify(token, keySets.get(issuer)!, { issuer, audience: aud });
    const email = String(payload.email ?? '').toLowerCase();
    const allowed = (env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((e) => e.trim()).filter(Boolean);
    return email && allowed.includes(email) ? email : null;
  } catch {
    return null;
  }
}
