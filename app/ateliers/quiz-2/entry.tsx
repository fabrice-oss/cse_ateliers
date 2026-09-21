'use client';
import Link from 'next/link';
import { errorMessage } from './client-errors';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Entry() {
  const router = useRouter();
  const [config, setConfig] = useState<{ ready: boolean; keyRequired: boolean; local: boolean } | null>(null);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [previous, setPrevious] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/quiz-2/sessions', { signal: controller.signal, cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(setConfig).catch(e => { if (e.name !== 'AbortError') setError('Impossible de contacter le quiz. Rechargez la page pour réessayer.'); });
    const frame = requestAnimationFrame(() => {
      try { const code = localStorage.getItem('quiz2-host'); if (code && /^\d{6}$/.test(code)) setPrevious(code); } catch { /* Resuming also works via the current session URL. */ }
    });
    return () => { controller.abort(); cancelAnimationFrame(frame); };
  }, []);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const r = await fetch('/api/quiz-2/sessions', { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      try { localStorage.setItem('quiz2-host', data.code); } catch { /* Cookie remains available. */ }
      router.push(`/ateliers/quiz-2/animer/${data.code}`);
    } catch (e) { setError(errorMessage(e, 'La session n’a pas pu être créée. Vérifiez votre connexion et réessayez.')); setBusy(false); }
  }
  return <><section className="quiz-hero"><div><p className="eyebrow">Réviser ensemble · Formation SSCT</p><h1>Quiz 2</h1><p>Un écran partagé.<br />Une réponse sur chaque appareil.</p></div><div className="quiz-hero-meta"><strong>30</strong><span>questions pour faire le point</span><p>Mandat · Missions · Consultations<br />Expertises · Négociation · CSSCT</p></div></section>
    <div className="quiz-entry"><section className="quiz-card"><p className="eyebrow">Vous participez</p><h2>À vous de jouer</h2><p>Scannez le QR code présenté par le formateur ou saisissez son code de session. Les questions apparaîtront automatiquement sur votre appareil.</p><Link className="button primary" href="/ateliers/quiz-2/rejoindre">Rejoindre une session →</Link><p className="quiz-small">Aucun compte, aucun nom. Une seule réponse par question, modifiable jusqu’à la fermeture des votes.</p></section>
    <section className="quiz-card"><p className="eyebrow">Vous animez</p><h2>Gardez le rythme</h2><p>Affichez le QR code, lancez chaque question, fermez les réponses puis révélez l’explication. Sans chronomètre imposé.</p><form onSubmit={create}>{config?.keyRequired && <label className="quiz-field">Clé formateur<input type="password" autoComplete="current-password" value={key} onChange={e => setKey(e.target.value)} required /></label>}<button className="button primary" disabled={!config?.ready || busy}>{busy ? 'Création…' : 'Créer une session'}</button></form>{previous && <p><Link href={`/ateliers/quiz-2/animer/${previous}`}>Reprendre ma dernière session ({previous})</Link></p>}{config && !config.ready && <p role="status" className="quiz-notice">Le mode collectif doit être configuré sur cet hébergement avant de créer une session.</p>}{config?.local && <p className="quiz-small">Aperçu local : les essais fonctionnent entre navigateurs sur cet ordinateur. L’accès à distance nécessite la publication du quiz.</p>}<p role="alert" className="quiz-error">{error}</p></section></div>
    <details className="quiz-context"><summary>Déroulement et contenu du quiz</summary><p>Une question et quatre propositions, avec une seule bonne réponse. Les deux premières minutes servent à rejoindre la session ; prévoyez ensuite 30 à 45 minutes selon les échanges. Tous les participants voient la même question au même moment, avec une actualisation environ toutes les deux secondes.</p><p>Le quiz reprend les notions des diapositives 101 à 226 du support SSCT initial. Les corrections renvoient aux diapositives et, pour les points juridiques, aux sources officielles. Les exemples sont pédagogiques ; ils ne décrivent pas d’événements avérés dans votre structure.</p><p>Les questions distinguent les rôles du CSE, de la CSSCT et des délégués syndicaux. Les corrigés précisent les conditions et exceptions utiles.</p></details>
  </>;
}
