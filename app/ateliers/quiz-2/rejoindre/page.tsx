import Join from './join';
export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string }> }) { const { code } = await searchParams; return <Join initialCode={typeof code === 'string' && /^\d{6}$/.test(code) ? code : ''} />; }
