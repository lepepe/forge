import { next } from '@vercel/functions';

// Runs on every page request (static assets are excluded below) so it can
// gate any note flagged `protected` in Obsidian, regardless of which folder
// it lives in. The list of protected URLs is generated at build time by
// protected-paths.njk and read here at request time, so it always matches
// the deployed content without needing the Middleware bundle itself rebuilt.
export const config = {
  matcher: ['/((?!img/|styles/|scripts/|protected-paths\\.json|favicon).*)'],
};

const CACHE_TTL_MS = 60_000;
let cachedPaths = null;
let cachedAt = 0;

async function getProtectedPaths(origin) {
  const now = Date.now();
  if (cachedPaths && now - cachedAt < CACHE_TTL_MS) {
    return cachedPaths;
  }
  try {
    const res = await fetch(new URL('/protected-paths.json', origin));
    cachedPaths = res.ok ? await res.json() : [];
  } catch {
    cachedPaths = [];
  }
  cachedAt = now;
  return cachedPaths;
}

function normalize(pathname) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const protectedPaths = await getProtectedPaths(url.origin);

  if (!protectedPaths.includes(normalize(url.pathname))) {
    return next();
  }

  const password = process.env.NOTES_PASSWORD;
  const username = process.env.NOTES_USERNAME || 'notes';

  // Fail closed: if no password is configured, block instead of leaving a
  // note flagged `protected` publicly readable.
  if (!password) {
    return new Response('Password not configured for this note', { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice('Basic '.length));
    const separatorIndex = decoded.indexOf(':');
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    if (user === username && pass === password) {
      return next();
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Private note", charset="UTF-8"' },
  });
}
