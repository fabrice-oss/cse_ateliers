'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ConsultationScenario } from './udaf77-scenarios';
import { consultationLegalRules, categoryLabel } from './udaf77-legal-rules';

type WizardStep = 1 | 2 | 3 | 4 | 5;
type QuestionField = 'missingInfo' | 'clarifications' | 'pointsToVerify';
type Questions = Record<QuestionField, string[]>;
type ExpertiseChoice = 'oui' | 'non' | '';
type Opinion = 'favorable' | 'defavorable' | '';
type AvisForm = {
  association: string;
  meetingDate: string;
  electedMembers: string;
  opinion: Opinion;
  motivation: string;
  reservations: string;
  followUp: string;
};

const questionFieldMeta: { field: QuestionField; label: string; placeholder: string }[] = [
  { field: 'missingInfo', label: 'Informations manquantes', placeholder: 'Ex. : le détail du budget prévisionnel n’a pas été transmis…' },
  { field: 'clarifications', label: 'Précisions à demander à l’employeur', placeholder: 'Ex. : quel calendrier précis pour la mise en œuvre ?' },
  { field: 'pointsToVerify', label: 'Points à vérifier avant l’avis', placeholder: 'Ex. : cohérence avec les orientations annoncées l’an dernier…' },
];

const emptyQuestions: Questions = { missingInfo: [], clarifications: [], pointsToVerify: [] };
const emptyAvis: AvisForm = { association: '', meetingDate: '', electedMembers: '', opinion: '', motivation: '', reservations: '', followUp: '' };

const storageKey = (scenarioId: string) => `cse-udaf77-consultation-${scenarioId}`;

export default function ConsultationWizard({ scenario }: { scenario: ConsultationScenario }) {
  const rule = consultationLegalRules[scenario.subtype];
  const [step, setStep] = useState<WizardStep>(1);
  const [hasRead, setHasRead] = useState(false);
  const [questions, setQuestions] = useState<Questions>(emptyQuestions);
  const [questionInputs, setQuestionInputs] = useState<Questions>(emptyQuestions);
  const [expertise, setExpertise] = useState<ExpertiseChoice>('');
  const [avis, setAvis] = useState<AvisForm>({ ...emptyAvis, association: scenario.structureFictive.nom });
  const [submitted, setSubmitted] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey(scenario.id));
        if (raw) {
          const parsed = JSON.parse(raw) as { hasRead?: boolean; questions?: Partial<Questions>; expertise?: ExpertiseChoice; avis?: Partial<AvisForm> };
          if (parsed.hasRead) setHasRead(true);
          if (parsed.questions) setQuestions({ ...emptyQuestions, ...parsed.questions });
          if (parsed.expertise) setExpertise(parsed.expertise);
          if (parsed.avis) setAvis((current) => ({ ...current, ...parsed.avis }));
        }
      } catch {
        // pas de sauvegarde disponible : on repart d’un parcours vide
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(storageKey(scenario.id), JSON.stringify({ hasRead, questions, expertise, avis })); } catch { /* stockage indisponible */ }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [scenario.id, hasRead, questions, expertise, avis, hydrated]);

  const goTo = (next: WizardStep) => {
    setStep(next);
    window.requestAnimationFrame(() => document.querySelector('.udaf-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const addQuestion = (field: QuestionField) => {
    const value = questionInputs[field].trim();
    if (!value) return;
    setQuestions((current) => ({ ...current, [field]: [...current[field], value] }));
    setQuestionInputs((current) => ({ ...current, [field]: '' }));
  };
  const removeQuestion = (field: QuestionField, index: number) => {
    setQuestions((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));
  };

  const updateAvis = (field: keyof AvisForm, value: string) => {
    setAvis((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  };

  const delaiApplicable = expertise === 'oui' ? rule.delaiAvecExpertiseMois : rule.delaiSimpleMois;
  const allQuestions = [...questions.missingInfo, ...questions.clarifications, ...questions.pointsToVerify];

  const downloadPdf = async (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitted(true);
    if (!avis.opinion) return;
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const textWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 20;
      const opinionLabel = avis.opinion === 'favorable' ? 'FAVORABLE' : 'DÉFAVORABLE';
      const accent: [number, number, number] = avis.opinion === 'favorable' ? [22, 123, 91] : [180, 60, 50];
      const dateLabel = avis.meetingDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${avis.meetingDate}T12:00:00`)) : 'Non renseignée';
      let y = 20;

      const ensureSpace = (height: number) => { if (y + height > bottomLimit) { doc.addPage(); y = 20; } };
      const addSection = (title: string, content: string) => {
        const value = content.trim() || 'Non renseigné';
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5);
        const lines = doc.splitTextToSize(value, textWidth) as string[];
        ensureSpace(13 + lines.length * 5.2);
        doc.setTextColor(22, 52, 43); doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); doc.text(title, margin, y); y += 7;
        doc.setTextColor(64, 83, 76); doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.text(lines, margin, y); y += lines.length * 5.2 + 7;
      };
      const addList = (title: string, items: string[]) => addSection(title, items.length ? items.map((item) => `• ${item}`).join('\n') : 'Aucune question notée.');

      doc.setFillColor(15, 82, 61); doc.rect(0, 0, pageWidth, 48, 'F');
      doc.setTextColor(223, 241, 106); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('EXERCICE PÉDAGOGIQUE · CONSULTATION OBLIGATOIRE UDAF 77', margin, 15);
      doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('Avis du comité social et économique', margin, 27);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.text(doc.splitTextToSize(scenario.title, textWidth), margin, 36);
      y = 58;

      doc.setFillColor(242, 245, 243); doc.roundedRect(margin, y, textWidth, 39, 2, 2, 'F');
      doc.setTextColor(22, 52, 43); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text('Structure :', margin + 5, y + 8); doc.text('Date de la réunion :', margin + 5, y + 17); doc.text('Élus ayant participé :', margin + 5, y + 26);
      doc.setFont('helvetica', 'normal');
      doc.text(avis.association || 'Non renseignée', margin + 26, y + 8);
      doc.text(dateLabel, margin + 45, y + 17);
      doc.text(doc.splitTextToSize(avis.electedMembers || 'Non renseigné', textWidth - 49).slice(0, 2), margin + 49, y + 26);
      y += 50;

      doc.setDrawColor(...accent); doc.setTextColor(...accent); doc.setLineWidth(0.7);
      doc.roundedRect(margin, y, 58, 14, 2, 2, 'S'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text(`AVIS ${opinionLabel}`, margin + 5, y + 9); y += 25;

      addSection('Recours à un expert', expertise === 'oui'
        ? `Oui. Délai porté à ${rule.delaiAvecExpertiseMois} mois. Financement : ${rule.financementExpert.employeurPct} % employeur / ${rule.financementExpert.csePct} % CSE.`
        : expertise === 'non'
          ? `Non. Délai applicable : ${rule.delaiSimpleMois} mois.`
          : 'Non tranché.');
      addList('Questions et points à faire répondre par écrit', allQuestions);
      addSection('Motivation de l’avis', avis.motivation);
      addSection('Réserves éventuelles', avis.reservations);
      addSection('Modalités de suivi', avis.followUp);

      const footerLines = doc.splitTextToSize(`Document produit dans le cadre d’un cas fictif de formation. Il ne constitue pas un conseil juridique. Base pédagogique : ${rule.articleDelai.label} et ${rule.articleExpertise.label}.`, textWidth) as string[];
      ensureSpace(footerLines.length * 4.2 + 10);
      doc.setDrawColor(204, 211, 207); doc.line(margin, y, pageWidth - margin, y); y += 6;
      doc.setTextColor(104, 115, 110); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(footerLines, margin, y);

      doc.save(`avis-cse-udaf77-${scenario.slug}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const stepLabels: [WizardStep, string][] = [[1, 'Lire'], [2, 'Questionner'], [3, 'Expertise'], [4, 'Rendre l’avis'], [5, 'Présenter']];

  if (presentation) {
    return (
      <main className="udaf-presentation">
        <header className="udaf-presentation-bar">
          <span>{scenario.title}</span>
          <button type="button" onClick={() => setPresentation(false)}>Revenir à l’édition ✕</button>
        </header>
        <div className="udaf-presentation-body">
          <section>
            <p className="eyebrow">{scenario.structureFictive.nom} · {scenario.structureFictive.effectif}</p>
            <h1>{scenario.title}</h1>
            <div className="udaf-presentation-grid">
              {scenario.chiffresCles.map((chiffre) => (
                <div key={chiffre.label}><span>{chiffre.label}</span><strong>{chiffre.valeur}</strong></div>
              ))}
            </div>
          </section>
          <section>
            <h2>Questions posées par le CSE</h2>
            {allQuestions.length ? (
              <ul className="udaf-presentation-list">{allQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
            ) : <p>Aucune question notée.</p>}
          </section>
          <section>
            <h2>Recours à l’expert</h2>
            <p>
              {expertise === 'oui' && `Oui — délai porté à ${rule.delaiAvecExpertiseMois} mois, financement ${rule.financementExpert.employeurPct} % employeur / ${rule.financementExpert.csePct} % CSE.`}
              {expertise === 'non' && `Non — délai applicable ${rule.delaiSimpleMois} mois.`}
              {!expertise && 'Non tranché.'}
            </p>
          </section>
          <section>
            <h2>Avis rendu</h2>
            <p className={`udaf-presentation-opinion ${avis.opinion}`}>{avis.opinion === 'favorable' ? 'Favorable' : avis.opinion === 'defavorable' ? 'Défavorable' : 'Non tranché'}</p>
            <p>{avis.motivation || 'Motivation à compléter.'}</p>
          </section>
        </div>
        <div className="udaf-presentation-actions">
          <button className="button primary" type="button" onClick={() => downloadPdf()} disabled={isGenerating}>{isGenerating ? 'Création…' : 'Télécharger l’avis en PDF'}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="duerp-page udaf-page" id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/ateliers/udaf-77">Les six consultations</a>
      </header>

      <section className="duerp-hero">
        <div>
          <p className="eyebrow">Consultation obligatoire · UDAF 77 · {rule.label}</p>
          <h1>{scenario.title}</h1>
          <p>{scenario.sousTitre}</p>
        </div>
        <aside className="inspection-hero-note">
          <span>{categoryLabel[rule.category]}</span>
          <strong>{scenario.accroche}</strong>
          <p>{scenario.structureFictive.nom} · {scenario.structureFictive.effectif} · {scenario.structureFictive.activite}</p>
        </aside>
      </section>

      <nav className="duerp-steps" aria-label="Étapes de la consultation">
        {stepLabels.map(([number, label]) => (
          <button type="button" key={number} className={step === number ? 'active' : step > number ? 'done' : ''} onClick={() => goTo(number)}>
            <span>{number}</span><strong>{label}</strong>
          </button>
        ))}
        <p>Sauvegarde locale active</p>
      </nav>

      <section className="duerp-workspace udaf-workspace">
        {step === 1 && (
          <div className="duerp-stage">
            <div className="duerp-stage-heading">
              <div><p className="eyebrow">Étape 1 · Lire</p><h2>Prendre connaissance des informations transmises</h2></div>
              <p>La note d’information ci-dessous reprend ce que l’employeur doit remettre au CSE avant la consultation.</p>
            </div>
            <div className="udaf-chiffres-grid">
              {scenario.chiffresCles.map((chiffre) => (
                <div key={chiffre.label}><span>{chiffre.label}</span><strong>{chiffre.valeur}</strong></div>
              ))}
            </div>
            <div className="udaf-accordion">
              {scenario.informationsTransmises.map((bloc) => (
                <details key={bloc.titre} open>
                  <summary>{bloc.titre}</summary>
                  <div>{bloc.contenu.map((paragraphe) => <p key={paragraphe}>{paragraphe}</p>)}</div>
                </details>
              ))}
            </div>
            <div className="udaf-question-grid-cards">
              {scenario.pointsAAnalyser.map((item, index) => (
                <article className="risk-card" key={item.title}>
                  <div className="risk-index">0{index + 1}</div>
                  <div><span className="risk-level">{item.level}</span><h3>{item.title}</h3><p>{item.text}</p></div>
                </article>
              ))}
            </div>
            <div className="prompt-box"><strong>Question à débattre</strong><p>{scenario.questionDebattre}</p></div>
            <div className="duerp-stage-actions">
              <a href="/ateliers/udaf-77">Quitter</a>
              <button className="button primary" type="button" onClick={() => { setHasRead(true); goTo(2); }}>J’ai pris connaissance des informations <span>→</span></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="duerp-stage">
            <div className="duerp-stage-heading">
              <div><p className="eyebrow">Étape 2 · Questionner</p><h2>Noter les questions du CSE</h2></div>
              <p>Consignez séparément ce qui manque, ce qui doit être précisé, et ce qui reste à vérifier.</p>
            </div>
            <div className="prompt-box">
              <strong>Rappel légal</strong>
              <p>{rule.articleDelai.label} : le CSE dispose d’un délai d’examen suffisant et doit recevoir des informations précises et écrites, avec une réponse motivée de l’employeur à ses observations. {rule.notePeutSaisirJuge}</p>
            </div>
            <div className="udaf-question-panel">
              {questionFieldMeta.map(({ field, label, placeholder }) => (
                <section className="duerp-panel" key={field}>
                  <h3>{label}</h3>
                  <div className="udaf-question-entry">
                    <input
                      value={questionInputs[field]}
                      onChange={(event) => setQuestionInputs((current) => ({ ...current, [field]: event.target.value }))}
                      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addQuestion(field); } }}
                      placeholder={placeholder}
                    />
                    <button className="button" type="button" onClick={() => addQuestion(field)}>Ajouter</button>
                  </div>
                  <ul className="udaf-question-list">
                    {questions[field].length ? questions[field].map((item, index) => (
                      <li key={`${field}-${item}-${index}`}><span>{item}</span><button type="button" onClick={() => removeQuestion(field, index)} aria-label="Retirer">×</button></li>
                    )) : <li className="empty">Aucune entrée pour le moment.</li>}
                  </ul>
                </section>
              ))}
            </div>
            <div className="duerp-stage-actions">
              <button className="text-button" type="button" onClick={() => goTo(1)}>← Lire</button>
              <button className="button primary" type="button" onClick={() => goTo(3)} disabled={!hasRead}>Décider du recours à l’expert <span>→</span></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="duerp-stage">
            <div className="duerp-stage-heading">
              <div><p className="eyebrow">Étape 3 · Expertise</p><h2>Décider d’un recours à l’expert</h2></div>
              <p>Le choix modifie le délai de consultation et, selon les cas, le financement de l’expertise.</p>
            </div>
            <div className="opinion-grid">
              <label className={`opinion-card positive ${expertise === 'oui' ? 'selected' : ''}`}>
                <input type="radio" name="expertise" value="oui" checked={expertise === 'oui'} onChange={() => setExpertise('oui')} />
                <span className="opinion-icon" aria-hidden="true">+</span><strong>Oui, le CSE recourt à un expert</strong>
                <small>Délai porté à {rule.delaiAvecExpertiseMois} mois.</small>
              </label>
              <label className={`opinion-card negative ${expertise === 'non' ? 'selected' : ''}`}>
                <input type="radio" name="expertise" value="non" checked={expertise === 'non'} onChange={() => setExpertise('non')} />
                <span className="opinion-icon" aria-hidden="true">−</span><strong>Non, pas d’expertise</strong>
                <small>Délai simple de {rule.delaiSimpleMois} mois.</small>
              </label>
            </div>
            <div className="udaf-expert-recap">
              <div><span>Délai applicable</span><strong>{delaiApplicable} mois</strong><small>{rule.articleDelai.label}</small></div>
              <div><span>Financement de l’expert</span><strong>{rule.financementExpert.employeurPct} % employeur · {rule.financementExpert.csePct} % CSE</strong><small>{rule.articleExpertise.label}</small></div>
            </div>
            {expertise === 'oui' && (
              <div className="prompt-box">
                <strong>Ce que cela implique</strong>
                <p>Le délai de consultation passe de {rule.delaiSimpleMois} à {rule.delaiAvecExpertiseMois} mois. {rule.financementExpert.csePct > 0 ? `Le CSE prend en charge ${rule.financementExpert.csePct} % du coût de l’expertise sur son budget de fonctionnement.` : 'Le coût de l’expertise est intégralement pris en charge par l’employeur.'}</p>
              </div>
            )}
            <div className="duerp-stage-actions">
              <button className="text-button" type="button" onClick={() => goTo(2)}>← Questionner</button>
              <button className="button primary" type="button" onClick={() => goTo(4)} disabled={!expertise}>Rendre l’avis motivé <span>→</span></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="duerp-stage">
            <div className="duerp-stage-heading">
              <div><p className="eyebrow">Étape 4 · Rendre l’avis</p><h2>Motiver et rendre l’avis du CSE</h2></div>
              <p>Reprenez les questions notées à l’étape 2 dans votre avis, si elles n’ont pas reçu de réponse écrite.</p>
            </div>
            {allQuestions.length > 0 && (
              <div className="duerp-panel">
                <h3>Rappel des questions notées</h3>
                <ul className="udaf-question-list readonly">{allQuestions.map((question, index) => <li key={`${question}-${index}`}><span>{question}</span></li>)}</ul>
              </div>
            )}
            <form onSubmit={downloadPdf}>
              <fieldset className="form-section">
                <legend><span>1</span> Identifier la délibération</legend>
                <div className="form-grid">
                  <label>Structure<input value={avis.association} onChange={(e) => updateAvis('association', e.target.value)} required /></label>
                  <label>Date de la réunion<input type="date" value={avis.meetingDate} onChange={(e) => updateAvis('meetingDate', e.target.value)} required /></label>
                </div>
                <label>Élus ayant participé<textarea rows={2} value={avis.electedMembers} onChange={(e) => updateAvis('electedMembers', e.target.value)} placeholder="Ex. : Marie Martin, titulaire ; Louis Robert, suppléant…" required /></label>
              </fieldset>
              <fieldset className="form-section">
                <legend><span>2</span> Choisir le sens de l’avis</legend>
                <div className="opinion-grid">
                  <label className={`opinion-card positive ${avis.opinion === 'favorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="favorable" checked={avis.opinion === 'favorable'} onChange={() => updateAvis('opinion', 'favorable')} /><span className="opinion-icon" aria-hidden="true">+</span><strong>Avis favorable</strong><small>Le CSE approuve, avec ou sans réserves.</small></label>
                  <label className={`opinion-card negative ${avis.opinion === 'defavorable' ? 'selected' : ''}`}><input type="radio" name="opinion" value="defavorable" checked={avis.opinion === 'defavorable'} onChange={() => updateAvis('opinion', 'defavorable')} /><span className="opinion-icon" aria-hidden="true">−</span><strong>Avis défavorable</strong><small>Le CSE n’approuve pas en l’état.</small></label>
                </div>
                {submitted && !avis.opinion && <p className="error" role="alert">Choisissez un avis favorable ou défavorable.</p>}
              </fieldset>
              <fieldset className="form-section">
                <legend><span>3</span> Motiver et rendre l’avis</legend>
                <label>Motivation de l’avis<textarea rows={5} value={avis.motivation} onChange={(e) => updateAvis('motivation', e.target.value)} placeholder="Ex. : le CSE demande que les questions suivantes reçoivent une réponse écrite avant…" required /></label>
                <div className="form-grid">
                  <label>Réserves éventuelles<textarea rows={3} value={avis.reservations} onChange={(e) => updateAvis('reservations', e.target.value)} placeholder="Facultatif" /></label>
                  <label>Suivi proposé<textarea rows={3} value={avis.followUp} onChange={(e) => updateAvis('followUp', e.target.value)} placeholder="Ex. : point de suivi lors de la prochaine réunion" /></label>
                </div>
              </fieldset>
              <div className="duerp-stage-actions">
                <button className="text-button" type="button" onClick={() => goTo(3)}>← Expertise</button>
                <button className="button primary" type="button" onClick={() => goTo(5)}>Ouvrir le mode présentation <span>→</span></button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="duerp-stage">
            <div className="duerp-stage-heading">
              <div><p className="eyebrow">Étape 5 · Présenter</p><h2>Passer en mode présentation</h2></div>
              <p>Un écran de synthèse plein écran, lisible à distance pour un partage d’écran à l’oral.</p>
            </div>
            <div className="duerp-report-panel">
              <div><p className="eyebrow">Dernière étape</p><h3>Ouvrir la synthèse plein écran</h3><p>Reprend le contexte, les questions posées, la décision d’expertise et l’avis rendu.</p></div>
              <div>
                <button className="button primary" type="button" onClick={() => setPresentation(true)}>Mode présentation</button>
                <button className="text-button light" type="button" onClick={() => downloadPdf()} disabled={isGenerating || !avis.opinion}>{isGenerating ? 'Création…' : 'Télécharger l’avis en PDF'}</button>
              </div>
            </div>
            <div className="duerp-stage-actions">
              <button className="text-button" type="button" onClick={() => goTo(4)}>← Rendre l’avis</button>
              <a href="/ateliers/udaf-77" className="button">Retour aux six consultations</a>
            </div>
          </div>
        )}
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Un outil pédagogique simple pour apprendre en faisant.</p><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}
