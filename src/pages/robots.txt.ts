import type { APIRoute } from 'astro';

export const prerender = true;

/** Internal directory — discourage indexing on any deploy without password protection. */
export const GET: APIRoute = () => {
  const body = `User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
