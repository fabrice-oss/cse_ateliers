import QRCode from 'qrcode';
import { requireHost } from '@/lib/quiz-2/engine';
import { failure, originOf, tokenFor } from '@/lib/quiz-2/http';
import { readSession } from '@/lib/quiz-2/store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const code = new URL(request.url).searchParams.get('code') || '';
    const row = await readSession(code);
    requireHost(row.data, await tokenFor(code, 'host'));
    const svg = await QRCode.toString(`${originOf(request)}/ateliers/quiz-2/rejoindre?code=${code}`, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 320, color: { dark: '#16342b', light: '#ffffff' } });
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) { return failure(error); }
}
