'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { associationInstruction, conclusion, consequences, definitions, disclaimer, instruction, overlap, questions, resources, scenario, situations, title } from './data';
import './workshop.css';
const KEY = 'cse-cinq-enjeux-udaf77-v1';
type Progress = { step: number; answers: (number | null)[]; notes: string[]; explanations: boolean[] };
const fresh = (): Progress => ({ step: 0, answers: Array(15).fill(null), notes: Array(10).fill(''), explanations: [false, false] });
const label = (n: number) => `${'ABCDE'[n]} — ${definitions[n][0]}`;
function Explanation({ index }: { index: number }) {
  const item = index < 10 ? situations[index] : consequences[index - 10];
  return <div className="enjeux-explanation"><strong>Enjeu principal : {definitions[item.answer][0]}</strong><p>{item.explanation}</p>{index < 10 && <><p><b>Les mots repères :</b> {situations[index].clue}</p><p>{situations[index].opening}</p></>}</div>;
}
export default function Workshop() {
  const [mode, setMode] = useState<'collective' | 'individual' | null>(null);
  const [progress, setProgress] = useState<Progress>(fresh);
  const [collectiveStep, setCollectiveStep] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [storage, setStorage] = useState('Progression enregistrée sur cet appareil.');
  const [reset, setReset] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (Number.isInteger(p.step) && p.step >= 0 && p.step <= 17 && Array.isArray(p.answers) && p.answers.length === 15 && p.answers.every((a: unknown) => a === null || (Number.isInteger(a) && Number(a) >= 0 && Number(a) < 5)) && Array.isArray(p.notes) && p.notes.length === 10 && p.notes.every((n: unknown) => typeof n === 'string') && Array.isArray(p.explanations) && p.explanations.length === 2 && p.explanations.every((v: unknown) => typeof v === 'boolean')) setProgress(p);
        }
      } catch { setStorage('Sauvegarde locale indisponible : gardez cet onglet ouvert.'); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!ready || mode !== 'individual') return;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); }
    catch { /* The status is updated asynchronously to keep rendering independent of storage. */
      const frame = requestAnimationFrame(() => setStorage('Sauvegarde locale indisponible : gardez cet onglet ouvert.'));
      return () => cancelAnimationFrame(frame);
    }
  }, [progress, ready, mode]);
  const individual = mode === 'individual';
  const step = individual ? progress.step : collectiveStep;
  const index = step < 10 ? step : step >= 11 && step <= 15 ? step - 1 : -1;
  const sequence = step <= 10 ? 0 : 1;
  const summary = step === 10 || step === 16;
  const go = (next: number) => {
    if (individual) setProgress(p => ({ ...p, step: next })); else setCollectiveStep(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }); });
  };
  const answer = (value: number) => setProgress(p => ({ ...p, answers: p.answers.map((a, i) => i === index ? value : a) }));
  const clear = () => {
    try { localStorage.removeItem(KEY); } catch { setStorage('Sauvegarde locale indisponible : gardez cet onglet ouvert.'); }
    setProgress(fresh()); setCollectiveStep(0); setRevealed([]); setReset(false); setMode(null);
  };
  return <main className="enjeux-page">
    <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></Link><Link className="header-link" href="/#ateliers">La bibliothèque</Link></header>
    <div className="enjeux-toolbar"><button className="button" onClick={() => dialog.current?.showModal()}>Comprendre les cinq enjeux</button>{mode && <button className="button" onClick={() => setMode(null)}>Changer de mode</button>}<Link href="/ateliers/cinq-enjeux-udaf77/synthese" target="_blank">Synthèse imprimable avec corrigés ↗</Link></div>
    <dialog ref={dialog} className="enjeux-dialog" aria-labelledby="definitions-title"><div className="enjeux-dialog-heading"><h2 id="definitions-title">Comprendre les cinq enjeux</h2><button className="button" onClick={() => dialog.current?.close()} autoFocus>Fermer</button></div>{definitions.map(([name, text, question], i) => <section key={name}><h3>{label(i)}</h3><p>{text}</p><p><b>Question repère :</b> {question}</p></section>)}<p>{overlap}</p></dialog>
    {!mode ? <>
      <section className="enjeux-intro"><p className="eyebrow">Prévention · 30 à 40 minutes · À distance</p><h1>{title}</h1><p>Distinguer les enjeux humain, social, économique, juridique et sociétal, puis comprendre comment un même événement peut les réunir.</p><p>Une durée adaptable par le formateur. Sur Zoom, pour deux participants ou davantage, sans limite imposée et sans compte.</p></section>
      <section className="enjeux-modes" aria-label="Choisir un mode"><article><p className="eyebrow">01 · Animation collective</p><h2>Un écran, des échanges</h2><p>Partagez votre écran. Les participants répondent dans le chat Zoom ou à l’oral ; vous révélez les explications au fil des échanges.</p><button className="button primary" onClick={() => setMode('collective')}>Animer sur Zoom</button></article><article><p className="eyebrow">02 · Parcours individuel</p><h2>À chacun son raisonnement</h2><p>Choisissez un enjeu, notez si vous le souhaitez votre justification et retrouvez vos réponses avant le débriefing.</p><button className="button primary" disabled={!ready} onClick={() => setMode('individual')}>Répondre individuellement</button>{ready && progress.answers.some(a => a !== null) && <p>Votre progression précédente sera reprise.</p>}</article></section>
      <p className="enjeux-notice">Les réponses individuelles restent sur l’appareil de chaque participant. Le formateur ne les reçoit pas dans l’application. Les échanges collectifs ont lieu dans Zoom ; aucune synchronisation entre appareils n’est prévue.</p>
    </> : <div className="enjeux-workspace">
      <div className="enjeux-progress"><span>{individual ? 'Parcours individuel' : 'Animation sur Zoom'} · {step === 17 ? 'Débriefing final' : `Séquence ${sequence + 1} sur 2`}</span><span>{individual ? `${progress.answers.filter(a => a !== null).length} / 15 réponses` : `${revealed.length} / 15 explications révélées`}</span></div>
      <nav className="enjeux-nav" aria-label="Parcours de l’atelier"><button aria-current={step <= 10 ? 'step' : undefined} onClick={() => go(0)}>1. Les situations</button><button aria-current={step >= 11 && step <= 16 ? 'step' : undefined} onClick={() => go(11)}>2. Un incident</button><button aria-current={step === 17 ? 'step' : undefined} onClick={() => go(17)}>3. Débriefing</button></nav>
      {step !== 17 && <nav className="enjeux-numbers" aria-label={sequence === 0 ? 'Choisir une situation' : 'Choisir une conséquence'}>{Array.from({ length: sequence === 0 ? 10 : 5 }, (_, i) => { const target = sequence === 0 ? i : i + 11; return <button key={i} aria-label={`${sequence === 0 ? 'Situation' : 'Conséquence'} ${i + 1}`} aria-current={step === target ? 'step' : undefined} onClick={() => go(target)}>{i + 1}</button>; })}<button aria-current={summary ? 'step' : undefined} onClick={() => go(sequence === 0 ? 10 : 16)}>Bilan</button></nav>}
      <section className="enjeux-panel">
        {index >= 0 ? <>
          <p className="eyebrow">{sequence === 0 ? `Situation ${index + 1} sur 10` : `Conséquence ${index - 9} sur 5`}</p>
          <h1 ref={heading} tabIndex={-1}>{sequence === 0 ? situations[index].title : 'Un incident, cinq conséquences'}</h1>
          <p className="enjeux-instruction">{sequence === 0 ? instruction : associationInstruction}</p>
          {sequence === 1 && <details className="enjeux-scenario" open><summary>Le scénario fictif</summary><p>{scenario}</p></details>}
          <p className="enjeux-situation">{sequence === 0 ? situations[index].text : consequences[index - 10].text}</p>
          {individual ? <><fieldset className="enjeux-choices"><legend>Quel enjeu principal choisissez-vous ?</legend>{definitions.map(([name], i) => <label key={name}><input type="radio" name={`answer-${index}`} checked={progress.answers[index] === i} onChange={() => answer(i)} />{label(i)}</label>)}</fieldset>{sequence === 0 && <label className="enjeux-justification">Votre justification (facultative)<textarea rows={3} value={progress.notes[index]} onChange={e => setProgress(p => ({ ...p, notes: p.notes.map((n, i) => i === index ? e.target.value : n) }))} placeholder="Quels mots ont guidé votre choix ?" /></label>}<p className="enjeux-small">Vos justifications libres ne sont pas évaluées automatiquement.</p></> : <><p>Choisissez une lettre et préparez votre justification. À l’invitation du formateur, répondez dans le chat Zoom ou à l’oral.</p><ol className="enjeux-choices enjeux-options">{definitions.map(([name], i) => <li key={name}>{label(i)}</li>)}</ol><details className="enjeux-tips"><summary>Conseils pour l’animation sur Zoom</summary><p>Demandez aux participants d’envoyer leurs réponses au même moment pour limiter l’influence des premiers répondants. Aucune saisie n’est nécessaire dans l’application.</p><p>Sous-groupes Zoom (facultatif) : « Mettez-vous d’accord sur un enjeu principal et désignez une personne pour expliquer votre raisonnement. »</p><p>Les réponses individuelles restent sur l’appareil de chaque participant. Les échanges collectifs ont lieu dans Zoom.</p></details>{!revealed.includes(index) && <button className="button primary" onClick={() => setRevealed(r => [...r, index])}>Révéler l’explication</button>}</>}
          <div aria-live="polite">{((individual && progress.explanations[sequence]) || (!individual && revealed.includes(index))) && <Explanation index={index} />}</div>
        </> : summary ? <>
          <p className="eyebrow">Séquence {sequence + 1} · Bilan</p><h1 ref={heading} tabIndex={-1}>{individual ? 'La synthèse de vos réponses' : 'Faire le point ensemble'}</h1>
          {individual && <><p>Pendant une formation, vous pouvez attendre le signal du formateur avant d’ouvrir les explications. Les justifications libres ne sont pas évaluées automatiquement.</p><p>{progress.answers.slice(sequence === 0 ? 0 : 10, sequence === 0 ? 10 : 15).filter(a => a !== null).length} / {sequence === 0 ? 10 : 5} réponses dans cette séquence. Vous pouvez revenir aux questions pour compléter ou modifier vos choix.</p></>}
          {(sequence === 0 ? situations : consequences).map((item, i) => { const n = sequence === 0 ? i : i + 10; return <article className="enjeux-review" key={n}><h2>{sequence === 0 ? `Situation ${i + 1} — ${situations[i].title}` : `Conséquence ${i + 1}`}</h2>{sequence === 1 && <p>{item.text}</p>}{individual && <><p><b>Votre choix :</b> {progress.answers[n] === null ? 'Sans réponse' : label(progress.answers[n]!)}</p>{sequence === 0 && progress.notes[n] && <p className="enjeux-note"><b>Votre justification :</b> {progress.notes[n]}</p>}</>}{((individual && progress.explanations[sequence]) || (!individual && revealed.includes(n))) && <Explanation index={n} />}</article>; })}
          {individual && !progress.explanations[sequence] && <button className="button primary" onClick={() => setProgress(p => ({ ...p, explanations: p.explanations.map((v, i) => i === sequence ? true : v) }))}>Consulter les explications</button>}
          {sequence === 1 && <p className="enjeux-conclusion">{conclusion}</p>}
        </> : <><p className="eyebrow">Débriefing final · Ensemble sur Zoom</p><h1 ref={heading} tabIndex={-1}>La prévention, plusieurs enjeux à la fois</h1><p className="enjeux-conclusion">{conclusion}</p><ol className="enjeux-questions">{questions.map(q => <li key={q}>{q}</li>)}</ol><p>Partagez vos raisonnements à l’oral ou dans le chat Zoom. Pour revoir vos réponses et ouvrir les explications, retrouvez le bilan de chaque séquence.</p><div className="enjeux-nav"><button onClick={() => go(10)}>Bilan de la séquence 1</button><button onClick={() => go(16)}>Bilan de la séquence 2</button></div></>}
        <div className="enjeux-bottom"><button className="button" disabled={step === 0} onClick={() => go(step - 1)}>← Précédent</button>{step < 17 && <button className="button primary" onClick={() => go(step + 1)}>{step === 9 || step === 15 ? 'Voir le bilan' : step === 10 ? 'Passer à la séquence 2' : step === 16 ? 'Débriefing final' : sequence === 0 ? 'Situation suivante →' : 'Conséquence suivante →'}</button>}</div>
      </section>
      {individual && <p className="enjeux-small" role="status">{storage} Aucune réponse n’est transmise au formateur.</p>}
    </div>}
    <footer className="enjeux-resources"><p>{disclaimer}</p><details><summary>Contexte et ressources</summary><p>L’UDAF 77 représente les familles de Seine-et-Marne et accompagne des familles et des personnes en situation de vulnérabilité. Ses activités comprennent notamment la protection juridique des majeurs, l’accompagnement budgétaire, le logement et l’accompagnement social mobile.</p><ul>{resources.map(([name, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{name} ↗</a></li>)}</ul></details><button className="button" onClick={() => setReset(true)}>Remettre à zéro</button>{reset && <div role="alert"><p>Effacer les réponses, les justifications et la progression de cet atelier sur cet appareil ?</p><button className="button" onClick={() => setReset(false)}>Annuler</button> <button className="button primary" onClick={clear}>Confirmer la remise à zéro</button></div>}</footer>
  </main>;
}
