import type { Metadata } from 'next';
import Workshop from './workshop';
import { title } from './data';
export const metadata: Metadata = { title: `${title} — Les ateliers du CSE`, description: 'Distinguer cinq enjeux de prévention, sur Zoom ou en parcours individuel. Un atelier de 30 à 40 minutes.', openGraph: { title, images: [] }, twitter: { title, images: [] } };
export default function Page() { return <Workshop />; }
