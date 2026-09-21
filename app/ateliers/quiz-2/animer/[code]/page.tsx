import { notFound } from 'next/navigation';
import Session from '../../session-view';
export default async function Page({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; if (!/^\d{6}$/.test(code)) notFound(); return <Session code={code} role="host" />; }
