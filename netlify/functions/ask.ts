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
  insight?: string;
}

interface AskBody {
  query?: string;
  matchCount?: number;
  hospitals?: HospitalBrief[];
}

function fallbackText(query: string, hospitals: HospitalBrief[], matchCount: number): string {
  if (!hospitals.length) {
    return `No TEAM hospitals matched “${query}”. Try a state code (TX), “top 50 CJR”, or “no outreach”.`;
  }
  const lead = hospitals[0];
  const greenfield = hospitals.filter((h) => h.outreach === "No").length;
  return `${matchCount} hospitals fit this search. ${greenfield} of the top matches still have no outreach. Lead with ${lead.name} (${lead.state}${lead.rank != null ? `, CJR #${lead.rank}` : ""}). Open a battle card below for the talk track.`;
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
          .slice(0, 12)
          .map((h) => {
            const bits = [
              `${h.name} in ${h.state}`,
              h.rank != null ? `CJR rank ${h.rank}` : null,
              h.stars != null ? `${h.stars} CMS stars` : null,
              h.outreach ? `${h.outreach} outreach` : null,
              h.insight ?? null,
            ].filter(Boolean);
            return `• ${bits.join(". ")}.`;
          })
          .join("\n")
      : "No structured matches supplied.";

  try {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are Stratus, Rainfall Health’s internal field brief for CMS TEAM hospitals. Write like a sales prep note: 2–4 short sentences, then at most 3 named hospitals. Never echo raw key=value or pipe-delimited dumps. Never invent contacts, TCV, or facts not in the match list. Mention outreach gaps, CJR rank, and CMS stars only in prose. End with one concrete next step for a conference or call.',
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
