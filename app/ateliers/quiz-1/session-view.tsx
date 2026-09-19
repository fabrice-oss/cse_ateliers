'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { errorMessage } from './client-errors';
import type { Correction, PublicQuestion, Snapshot } from '@/lib/quiz-1/types';
type View = Snapshot & { joinUrl: string; localOnly: boolean };
const letters = 'ABCD';
const phaseLabel = { lobby: 'Accueil du groupe', open: 'Réponses ouvertes', closed: 'Réponses fermées', revealed: 'Explication révélée', finished: 'Session terminée' };
function Explanation({ correction, question }: { correction: Correction; question: PublicQuestion }) {
  return <div className="quiz-explanation"><p className="eyebrow">Le repère à retenir</p><h2>Réponse {letters[correction.correct]} — {question.choices[correction.correct]}</h2><p>{correction.explanation}</p><details><summary>Support et sources</summary><p>Diapositives {correction.slides} · Support SSCT initial, périmètre 1 à 99.</p>{correction.sources.length > 0 && <ul>{correction.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}</ul>}</details></div>;
}
function Distribution({ question, counts, answered, correct }: { question: PublicQuestion; counts: number[]; answered: number; correct: number }) {
  return <div className="quiz-distribution" role="group" aria-label="Répartition des réponses du groupe">{question.choices.map((choice, i) => <div className="quiz-result-row" key={i}><div><span><b>{letters[i]}</b> {choice}{i === correct && <strong className="quiz-correct-label"> · Bonne réponse</strong>}</span><strong>{counts[i]} <small>({answered ? Math.round(counts[i] / answered * 100) : 0} %)</small></strong></div><div className="quiz-bar" aria-hidden="true"><span style={{ width: `${answered ? counts[i] / answered * 100 : 0}%` }} /></div></div>)}<p className="quiz-small">{answered} réponse{answered > 1 ? 's' : ''} · Pourcentages calculés sur les réponses reçues.</p></div>;
}
function AnswerForm({ code, question, selected, connected, onSaved }: { code: string; question: PublicQuestion; selected: number | null; connected: boolean; onSaved: () => void }) {
  const [choice, setChoice] = useState<number | null>(selected);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<number | null>(selected);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (choice === null) return; setBusy(true); setError('');
    try {
      const r = await fetch(`/api/quiz-1/sessions/${code}`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'answer', questionId: question.id, choice }) });
      const body = await r.json(); if (!r.ok) throw new Error(body.error);
      setSaved(choice); onSaved();
    } catch (e) { setError(errorMessage(e, 'Réponse non enregistrée. Vérifiez la connexion et réessayez.')); onSaved(); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="quiz-answer-form"><fieldset disabled={!connected || busy}><legend>Choisissez une seule réponse</legend>{question.choices.map((text, i) => <label className="quiz-choice" key={i}><input type="radio" name={`question-${question.id}`} checked={choice === i} onChange={() => setChoice(i)} /><b>{letters[i]}</b><span>{text}</span></label>)}</fieldset><button className="button primary" disabled={!connected || choice === null || busy}>{busy ? 'Envoi…' : saved === null ? 'Envoyer ma réponse' : choice === saved ? 'Renvoyer ma réponse' : 'Modifier ma réponse'}</button><p role="status" className="quiz-saved">{saved !== null ? `✓ Réponse ${letters[saved]} enregistrée. Vous pouvez la modifier tant que les réponses sont ouvertes.` : 'Votre choix sera enregistré après l’envoi.'}</p><p role="alert" className="quiz-error">{error}</p></form>;
}
function Invite({ view }: { view: View }) {
  const [message, setMessage] = useState('');
  return <div className="quiz-invite"><img src={`/api/quiz-1/qr?code=${view.code}`} alt={`QR code pour rejoindre la session ${view.code}. Le lien et le code sont également proposés en texte.`} width={300} height={300} /><div><p className="eyebrow">Scannez pour participer</p><p className="quiz-session-code" aria-label={`Code de session ${view.code.split('').join(' ')}`}>{view.code}</p><p>Ou ouvrez le lien et rejoignez la session :</p><a className="quiz-join-url" href={view.joinUrl} target="_blank" rel="noreferrer">{view.joinUrl}</a><button className="button" onClick={async () => { try { await navigator.clipboard.writeText(view.joinUrl); setMessage('Lien copié. Vous pouvez le coller dans le chat Zoom.'); } catch { setMessage('Sélectionnez le lien ci-dessus pour le copier.'); } }}>Copier le lien participant</button><p role="status" className="quiz-small">{message}</p></div>{view.localOnly && <p className="quiz-notice">Aperçu sur cet ordinateur : ce QR code pointe vers une adresse locale. Pour des participants à distance, publiez le quiz et utilisez son adresse publique. Le lien peut déjà être testé dans un autre navigateur de cet ordinateur.</p>}</div>;
}
export default function SessionView({ code, role }: { code: string; role: 'host' | 'participant' }) {
  const [view, setView] = useState<View | null>(null);
  const [connected, setConnected] = useState(false);
  const [fatal, setFatal] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [confirm, setConfirm] = useState<'finish' | 'delete' | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const host = role === 'host';
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>; let active = true; let running = false;
    async function poll() {
      if (running || !active) return; running = true;
      const timeout = new AbortController();
      const abort = () => timeout.abort();
      controller.signal.addEventListener('abort', abort, { once: true });
      const deadline = setTimeout(abort, 10_000);
      try {
        const r = await fetch(`/api/quiz-1/sessions/${code}?role=${role}`, { cache: 'no-store', signal: timeout.signal });
        const data = await r.json();
        if (!active) return;
        if (!r.ok) {
          if ([401,403,404].includes(r.status)) { setFatal(true); active = false; }
          throw new Error(data.error);
        }
        setView(previous => !previous || data.revision >= previous.revision ? data : previous);
        setConnected(true); setError(''); setFatal(false);
      } catch (e) {
        if (controller.signal.aborted) return;
        setConnected(false); setError(errorMessage(e, 'Connexion interrompue. Reconnexion automatique en cours…'));
      } finally {
        clearTimeout(deadline); controller.signal.removeEventListener('abort', abort); running = false;
        if (active) timer = setTimeout(poll, 2000);
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible' && !running) { clearTimeout(timer); void poll(); } };
    void poll(); document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; controller.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [code, role, refresh]);
  const currentQuestion = view?.current;
  const currentPhase = view?.phase;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [currentQuestion, currentPhase]);
  function printResults() {
    const details = Array.from(document.querySelectorAll<HTMLDetailsElement>('.quiz-recap'));
    const opened = details.map(d => d.open);
    details.forEach(d => { d.open = true; });
    window.addEventListener('afterprint', () => details.forEach((d, i) => { d.open = opened[i]; }), { once: true });
    requestAnimationFrame(() => window.print());
  }
  async function act(action: string) {
    if (!view) return; setBusy(true); setActionError('');
    try {
      const r = await fetch(`/api/quiz-1/sessions/${code}`, { method: action === 'delete' ? 'DELETE' : 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, current: view.current, phase: view.phase }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      setConfirm(null);
      if (action === 'delete') {
        try { if (localStorage.getItem('quiz1-host') === code) localStorage.removeItem('quiz1-host'); } catch { /* Optional shortcut only. */ }
        router.replace('/ateliers/quiz-1'); return;
      }
    } catch (e) { setActionError(errorMessage(e, 'La connexion a été interrompue. Vérifiez l’état de la session avant de réessayer.')); }
    finally { setBusy(false); setRefresh(n => n+1); }
  }
  return <div className={`quiz-session ${host ? 'quiz-host' : 'quiz-participant'}`}>
    <div className="quiz-session-top"><div><p className="eyebrow">Quiz 1 · {host ? 'Espace formateur' : 'Espace participant'}</p><p>Session <b>{code}</b>{view && <> · {view.participants} participant{view.participants > 1 ? 's' : ''} inscrit{view.participants > 1 ? 's' : ''}</>}</p></div><p className="quiz-connection" role="status">{connected ? '● Connecté · Actualisation automatique' : '○ Connexion en cours'}</p></div>
    {error && <div className="quiz-notice" role="alert"><p>{error}</p>{fatal ? <Link href={host ? '/ateliers/quiz-1' : `/ateliers/quiz-1/rejoindre?code=${code}`}>{host ? 'Retour à Quiz 1' : 'Rejoindre à nouveau'}</Link> : <button className="button" onClick={() => setRefresh(n => n+1)}>Réessayer maintenant</button>}</div>}
    {!view && !error && <p role="status">Ouverture de la session…</p>}
    {view && !fatal && <>
      <div className="quiz-step-line"><span className="quiz-phase">{phaseLabel[view.phase]}</span><span>{view.current >= 0 ? `Question ${view.current + 1} / ${view.total}` : `${view.total} questions · Une seule bonne réponse`}</span></div>
      {view.phase === 'lobby' ? <section className="quiz-card"><h1 ref={heading} tabIndex={-1}>{host ? 'Invitez votre groupe' : 'Vous êtes dans la session'}</h1>{host ? <><p>Partagez cet écran. Le groupe peut scanner le QR code ou utiliser le lien dans le chat Zoom. Commencez lorsque tout le monde est prêt.</p><Invite view={view} /><button className="button primary" disabled={!connected || busy} onClick={() => act('start')}>Lancer la première question →</button><p className="quiz-small">Le nombre affiché correspond aux participants inscrits, pas à une présence vérifiée en temps réel.</p></> : <div className="quiz-waiting"><span aria-hidden="true">01</span><h2>Le formateur va lancer la première question.</h2><p>Gardez cette page ouverte. Les questions apparaîtront automatiquement, sans recharger.</p><p>Une seule bonne réponse par question. Prenez le temps de réfléchir : aucun classement de vitesse.</p></div>}</section>
      : view.phase === 'finished' ? <section className="quiz-card"><p className="eyebrow">Le bilan</p><h1 ref={heading} tabIndex={-1}>{host ? 'Revenir sur les repères' : 'Votre bilan personnel'}</h1>{!host && <p className="quiz-score"><strong>{view.score} / {view.results.length}</strong> réponses justes parmi les questions corrigées</p>}<p>{view.results.length} question{view.results.length > 1 ? 's' : ''} corrigée{view.results.length > 1 ? 's' : ''} sur {view.total}. {view.results.length < view.total && 'La session a été arrêtée avant la fin : les questions non révélées ne sont pas notées.'} Les absences de réponse aux questions corrigées ne rapportent pas de point.</p><p>Quels repères souhaitez-vous reprendre avec le groupe ? Échangez à l’oral ou dans le chat Zoom.</p><div className="quiz-actions print-hidden">{host && <a className="button primary" href={`/api/quiz-1/sessions/${code}?role=host&export=1`}>Exporter le bilan collectif (CSV)</a>}<button className="button" onClick={printResults}>Imprimer le bilan</button></div>{view.results.map(r => <details className="quiz-recap" key={r.question.id}><summary>Question {r.question.id} — {r.question.text}</summary>{!host && <p><b>Votre réponse :</b> {r.selected === null ? 'Sans réponse' : `${letters[r.selected]} — ${r.question.choices[r.selected]}`}</p>}{host && <Distribution question={r.question} counts={r.counts} answered={r.answered} correct={r.correction.correct} />}<Explanation correction={r.correction} question={r.question} /></details>)}{!host && <p className="quiz-small">Votre score est personnel et n’est pas affiché dans un classement.</p>}</section>
      : view.question && <section className="quiz-card quiz-question-card"><p className="eyebrow">{view.question.theme}</p><h1 ref={heading} tabIndex={-1}>{view.question.text}</h1>
        {host ? <>{!view.correction && <ol className="quiz-proposals">{view.question.choices.map((text, i) => <li key={i}><b>{letters[i]}</b><span>{text}</span></li>)}</ol>}<p className="quiz-response-count" aria-live="polite"><strong>{view.answered}</strong> / {view.participants} réponses reçues</p><div className="quiz-actions">{view.phase === 'open' && <button className="button primary" disabled={!connected || busy} onClick={() => act('close')}>Fermer les réponses</button>}{view.phase === 'closed' && <button className="button primary" disabled={!connected || busy} onClick={() => act('reveal')}>Révéler les résultats et l’explication</button>}</div></>
        : view.phase === 'open' ? <AnswerForm key={view.question.id} code={code} question={view.question} selected={view.selected} connected={connected} onSaved={() => setRefresh(n => n+1)} />
        : <div className="quiz-answer-locked"><p><b>Votre réponse :</b> {view.selected === null ? 'Vous n’avez pas envoyé de réponse à cette question.' : `${letters[view.selected]} — ${view.question.choices[view.selected]}`}</p>{view.phase === 'closed' && <p role="status">Les réponses sont fermées. Le formateur va révéler l’explication.</p>}</div>}
        {view.correction && <>{host && view.counts && <Distribution question={view.question} counts={view.counts} answered={view.answered} correct={view.correction.correct} />}<Explanation correction={view.correction} question={view.question} />{!host && <p className="quiz-saved">{view.selected === view.correction.correct ? '✓ Vous avez trouvé le bon repère.' : view.selected === null ? 'Vous pourrez répondre à la prochaine question.' : 'Un repère à revoir avec le groupe.'} La suite apparaîtra quand le formateur la lancera.</p>}{host && <button className="button primary" disabled={!connected || busy} onClick={() => act('next')}>{view.current === view.total - 1 ? 'Afficher le bilan final' : 'Question suivante →'}</button>}</>}
      </section>}
      {host && <div className="quiz-host-tools print-hidden">{view.phase !== 'lobby' && view.phase !== 'finished' && <details><summary>Inviter un participant en cours de session</summary><Invite view={view} /></details>}<div className="quiz-actions">{view.phase !== 'finished' && <button className="button" disabled={!connected || busy} onClick={() => setConfirm('finish')}>Terminer la session maintenant</button>}<button className="button" disabled={!connected || busy} onClick={() => setConfirm('delete')}>Supprimer cette session</button><Link href="/ateliers/quiz-1">Retour à Quiz 1</Link></div>{confirm && <div className="quiz-notice" role="alert"><p>{confirm === 'delete' ? 'Supprimer définitivement cette session et ses réponses ? Les participants ne pourront plus y accéder.' : 'Arrêter le quiz ici ? Seules les questions déjà corrigées seront incluses dans le bilan.'}</p><button className="button" onClick={() => setConfirm(null)}>Annuler</button> <button className="button primary" disabled={busy || !connected} onClick={() => act(confirm)}>Confirmer</button></div>}<p className="quiz-small">Session accessible jusqu’au {new Date(view.expiresAt).toLocaleString('fr-FR')}. Conservez ce navigateur pour retrouver vos commandes.</p></div>}
      <p role="alert" className="quiz-error">{actionError}</p>
    </>}
  </div>;
}