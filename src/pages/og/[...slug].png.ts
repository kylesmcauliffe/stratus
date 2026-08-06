import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { coreIndexedPages, ogSlugForPath } from '@/data/page-index';
import { siteConfig } from '@/data/site-config';
import { ogTemplate } from '@/lib/og-template';

export const prerender = true;

interface SlugProps {
  title: string;
  description?: string;
  eyebrow?: string;
  byline?: string;
}

export async function getStaticPaths() {
  const pagePaths = coreIndexedPages.map((page) => ({
    params: { slug: ogSlugForPath(page.path) },
    props: {
      title: page.title,
      description: page.summary,
      eyebrow: page.group,
    } satisfies SlugProps,
  }));

  const hospitalProfileOg = {
    params: { slug: 'hospitals/profile' },
    props: {
      title: 'CMS TEAM Hospital Profile',
      description:
        'Individual hospital on the CMS Transforming Episode Accountability Model (TEAM) mandated participant list.',
      eyebrow: 'Directory',
    } satisfies SlugProps,
  };

  const fallback = {
    params: { slug: 'default' },
    props: {
      title: siteConfig.name,
      description: siteConfig.description,
      eyebrow: 'Directory',
    } satisfies SlugProps,
  };

  return [...pagePaths, hospitalProfileOg, fallback];
}

const fontsDir = path.join(process.cwd(), 'src/assets/fonts');
const [interRegular, interBold] = await Promise.all([
  fs.readFile(path.join(fontsDir, 'Inter-Regular.ttf')),
  fs.readFile(path.join(fontsDir, 'Inter-Bold.ttf')),
]);

export const GET: APIRoute<SlugProps> = async ({ props }) => {
  const tree = ogTemplate({
    title: props.title,
    description: props.description,
    eyebrow: props.eyebrow,
    byline: props.byline,
  });

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBold,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
    .render()
    .asPng();

  const body = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
