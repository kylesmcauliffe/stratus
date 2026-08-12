import type { Config, Context } from '@netlify/functions';
import OpenAI from 'openai';

interface HospitalBrief {
  slug: string;
  name: string;
  state: string;
  stars?: number | null;
  mspb?: number | null;
  rank?: number | null;
  outreach?: string | null;
  pipeline?: string | null;
  beds?: number | null;
  system?: string | null;
  flags?: string[];
}

interface AskBody {
  query?: string;
  matchCount?: number;
  hospitals?: HospitalBrief[];
}

function fallbackText(query: string, hospitals: HospitalBrief[], matchCount: number): string {
  if (!hospitals.length) {
    return `I couldn't find TEAM hospitals matching "${query}". Try a state code (TX), "top 50 CJR", or "no outreach".`;
  }
  const lines = hospitals.slice(0, 5).map((h) => {
    const bits = [
      h.stars != null ? `${h.stars}★` : null,
      h.rank != null ? `CJR #${h.rank}` : null,
      h.outreach ? `${h.outreach} outreach` : null,
    ].filter(Boolean);
    return `• ${h.name} (${h.state})${bits.length ? ` — ${bits.join(' · ')}` : ''}`;
  });
  return `Found ${matchCount} hospitals for "${query}". Top matches:\n\n${lines.join('\n')}${matchCount > 5 ? `\n\nOpen Home or Compare for all ${matchCount} matches.` : ''}`;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: AskBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const query = String(body.query ?? '').trim();
  const hospitals = Array.isArray(body.hospitals) ? body.hospitals : [];
  const matchCount = body.matchCount ?? hospitals.length;

  if (!query) {
    return new Response(JSON.stringify({ error: 'query required' }), { status: 400 });
  }

  const hospitalBlock =
    hospitals.length > 0
      ? hospitals
          .slice(0, 15)
          .map(
            (h) =>
              `- ${h.name} (${h.state}, slug=${h.slug}) | stars=${h.stars ?? '—'} | MSPB=${h.mspb ?? '—'} | CJR rank=${h.rank ?? '—'} | outreach=${h.outreach ?? '—'} | pipeline=${h.pipeline ?? '—'} | beds=${h.beds ?? '—'} | system=${h.system ?? '—'} | flags=${(h.flags ?? []).join(', ') || 'none'}`,
          )
          .join('\n')
      : 'No structured matches supplied.';

  try {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are Stratus, Rainfall Health\'s internal research assistant for CMS TEAM hospitals (~719 mandated sites). Answer concisely in 2–4 short paragraphs. Use bullet lists for hospital names when listing matches. Be factual — only cite hospitals from the provided match list. Mention Rainfall outreach, CJR rank, CMS stars, MSPB, and pipeline when relevant. Do not invent contacts or TCV numbers not in the data. End with a practical next step for a field rep at a conference.',
        },
        {
          role: 'user',
          content: `User question: ${query}\n\nTotal directory matches: ${matchCount}\n\nTop matches:\n${hospitalBlock}`,
        },
      ],
      max_tokens: 700,
      temperature: 0.35,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      fallbackText(query, hospitals, matchCount);

    return Response.json({ text, source: 'ai' });
  } catch (err) {
    console.error('Ask AI fallback:', err);
    return Response.json({
      text: fallbackText(query, hospitals, matchCount),
      source: 'fallback',
    });
  }
};

export const config: Config = {
  path: '/api/ask',
  method: 'POST',
};
