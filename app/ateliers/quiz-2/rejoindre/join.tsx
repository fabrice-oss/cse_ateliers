'use client';
import { errorMessage } from '../client-errors';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function Join({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function join(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const r = await fetch(`/api/quiz-2/sessions/${code}`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'join' }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      router.replace(`/ateliers/quiz-2/session/${code}`);
    } catch (e) { setError(errorMessage(e, 'Connexion impossible. Vérifiez votre connexion et réessayez.')); setBusy(false); }
  }
  return <section className="quiz-join quiz-card"><p className="eyebrow">Quiz 2 · Espace participant</p><h1>Rejoindre le groupe</h1><p>Le formateur pilote les questions. Vous répondez ici, sur votre appareil.</p><form onSubmit={join}><label className="quiz-field">Code de session<input className="quiz-code-input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} autoComplete="off" placeholder="000000" required /></label><button className="button primary" disabled={busy || code.length !== 6}>{busy ? 'Connexion…' : 'Rejoindre Quiz 2 →'}</button></form><p className="quiz-small">Sans nom ni compte. Gardez ce navigateur pour retrouver votre participation. Vos choix sont enregistrés pour cette session ; le formateur voit les résultats du groupe, sans liste nominative.</p><p role="alert" className="quiz-error">{error}</p></section>;
}
