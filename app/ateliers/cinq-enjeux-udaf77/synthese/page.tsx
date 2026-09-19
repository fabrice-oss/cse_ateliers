import Link from 'next/link';
import { associationInstruction, conclusion, consequences, definitions, disclaimer, instruction, overlap, questions, resources, scenario, situations, title } from '../data';
import PrintButton from './print-button';
import './print.css';
export const metadata = { title: `Synthèse et corrigés — ${title}` };
export default function Synthesis() {
  return <main className="enjeux-print"><nav><Link href="/ateliers/cinq-enjeux-udaf77">← Retour à l’atelier</Link><PrintButton /></nav><h1>{title}</h1><p>30 à 40 minutes · Synthèse pédagogique et corrigés</p><p>{disclaimer}</p><section><h2>Les cinq enjeux</h2>{definitions.map(([name, text, question]) => <article key={name}><h3>{name}</h3><p>{text}</p><p><b>Question repère :</b> {question}</p></article>)}<p>{overlap}</p></section>
  <section className="print-break"><h2>Énoncés — Séquence 1</h2><p>{instruction}</p><p>A — Humain · B — Social · C — Économique · D — Juridique · E — Sociétal</p>{situations.map((s, i) => <article key={s.title}><h3>Situation {i + 1} — {s.title}</h3><p>{s.text}</p><p className="print-answer">Enjeu principal et justification : ........................................................................</p></article>)}</section>
  <section className="print-break"><h2>Énoncés — Séquence 2 : un incident, cinq conséquences</h2><p>{scenario}</p><p>{associationInstruction}</p>{consequences.map((c, i) => <article key={c.text}><h3>Conséquence {i + 1}</h3><p>{c.text}</p><p className="print-answer">Enjeu principal : ............................................................</p></article>)}</section>
  <section className="print-break"><h2>Corrigés — Séquence 1</h2>{situations.map((s, i) => <article key={s.title}><h3>Situation {i + 1} — {s.title}</h3><p><b>Enjeu principal : {definitions[s.answer][0]}.</b> {s.explanation}</p><p><b>Indice :</b> {s.clue}</p><p>{s.opening}</p></article>)}</section>
  <section className="print-break"><h2>Corrigés — Séquence 2</h2>{consequences.map((c, i) => <article key={c.text}><h3>Conséquence {i + 1} — {definitions[c.answer][0]}</h3><p>{c.text}</p><p>{c.explanation}</p></article>)}<p>{conclusion}</p><h2>Débriefing final</h2><ol>{questions.map(q => <li key={q}>{q}</li>)}</ol><h2>Contexte et ressources</h2><ul>{resources.map(([name, url]) => <li key={url}><a href={url}>{name}</a></li>)}</ul></section></main>;
}
