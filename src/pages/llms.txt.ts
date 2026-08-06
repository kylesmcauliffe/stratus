import type { APIRoute } from 'astro';
import {
  llmsCitationBlock,
  llmsMetadata,
  llmsPageIndex,
  llmsTeamFacts,
} from '@/lib/llms-sections';
import { getSiteUrl } from '@/lib/site-url';

export const prerender = true;

export const GET: APIRoute = async () => {
  const SITE = getSiteUrl();

  const lines = [
    ...llmsMetadata(SITE),
    ...llmsTeamFacts(),
    ...llmsPageIndex(SITE),
    ...llmsCitationBlock(SITE),
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
