import type { Metadata } from 'next';
import { udaf77Scenarios } from '../../udaf77-scenarios';
import { consultationLegalRules, categoryLabel } from '../../udaf77-legal-rules';

export const metadata: Metadata = {
  title: 'Consultations obligatoires — UDAF 77',
  description: 'Six scénarios pour s’entraîner aux consultations obligatoires du CSE : orientations stratégiques, situation économique, politique sociale et consultations ponctuelles.',
};

export default function Udaf77Page() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Retour à l’accueil des ateliers du CSE"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></a>
        <a className="header-link" href="/">Tous les ateliers</a>
      </header>

      <section className="home-hero compact-hero">
        <div><p className="eyebrow">Consultations obligatoires · UDAF 77</p><h1>Six consultations, un même parcours en cinq étapes.</h1></div>
        <p className="home-intro">Lisez les informations transmises, notez vos questions, décidez d’un recours à l’expert, rendez un avis motivé, puis présentez le tout à l’oral.</p>
      </section>

      <section className="workshop-library" id="scenarios">
        <div className="workshop-cards three-cards">
          {udaf77Scenarios.map((scenario, index) => {
            const rule = consultationLegalRules[scenario.subtype];
            const badgeClass = rule.category === 'recurrente' ? 'recurrente' : 'ponctuelle';
            const cardContent = (
              <>
                <div className="workshop-card-top">
                  <span className="workshop-number">0{index + 1}</span>
                  <span className={`udaf-badge ${scenario.disponible ? badgeClass : 'soon'}`}>{scenario.disponible ? categoryLabel[rule.category] : 'Bientôt disponible'}</span>
                </div>
                <div className="workshop-card-body">
                  <h3>{rule.label}</h3>
                  <p>{scenario.disponible ? scenario.accroche : 'Ce scénario sera complété prochainement. Le moteur des cinq étapes reste identique.'}</p>
                </div>
                <div className="workshop-card-footer">
                  <span>{scenario.disponible ? 'Cas fictif · Disponible' : 'Cas fictif · Bientôt'}</span>
                  <strong aria-hidden="true">{scenario.disponible ? '→' : '·'}</strong>
                </div>
              </>
            );
            return scenario.disponible ? (
              <a className="workshop-card lime" href={`/ateliers/udaf-77/${scenario.slug}`} key={scenario.id}>{cardContent}</a>
            ) : (
              <div className="workshop-card soon" aria-disabled="true" key={scenario.id}>{cardContent}</div>
            );
          })}
        </div>
      </section>

      <footer className="footer"><div className="brand"><span className="brand-mark">CSE</span><span>Les ateliers du CSE</span></div><p>Six situations, un même objectif : consulter dans les règles.</p><a href="/">Retour aux ateliers ↑</a></footer>
    </main>
  );
}
