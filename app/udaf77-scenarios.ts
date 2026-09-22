import { ConsultationSubtype } from './udaf77-legal-rules';

export type ChiffreCle = { label: string; valeur: string };

export type InformationBloc = { titre: string; contenu: string[] };

export type PointAAnalyser = { title: string; level: string; text: string };

export type ConsultationScenario = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  subtype: ConsultationSubtype;
  disponible: boolean;
  structureFictive: { nom: string; effectif: string; activite: string };
  accroche: string;
  sousTitre: string;
  chiffresCles: ChiffreCle[];
  informationsTransmises: InformationBloc[];
  pointsAAnalyser: PointAAnalyser[];
  questionDebattre: string;
};

// Un seul scénario complet pour valider le moteur de bout en bout ; les cinq autres
// sont des emplacements réservés (badge « Bientôt disponible ») pour les futurs contenus.
export const udaf77Scenarios: ConsultationScenario[] = [
  {
    id: 'orientations-strategiques-udaf77',
    slug: 'orientations-strategiques-udaf77',
    title: 'Orientations stratégiques de l’UDAF 77',
    metaDescription:
      'Cas fictif de test : consultation sur les orientations stratégiques de l’UDAF 77, protection juridique des majeurs.',
    subtype: 'orientations-strategiques',
    disponible: true,
    structureFictive: {
      nom: 'UDAF 77 (cas fictif)',
      effectif: '35 salariés',
      activite: 'Protection juridique des majeurs',
    },
    accroche: 'Examiner les orientations stratégiques présentées par la direction pour les trois prochaines années.',
    sousTitre:
      'Prenez connaissance de la note d’information, posez vos questions, décidez d’un recours à l’expert, puis rendez un avis motivé.',
    chiffresCles: [
      { label: 'Effectif', valeur: '35 salariés' },
      { label: 'Mesures de protection suivies', valeur: 'À compléter' },
      { label: 'Horizon du plan', valeur: 'À compléter' },
      { label: 'Budget prévisionnel', valeur: 'À compléter' },
    ],
    informationsTransmises: [
      {
        titre: 'Contexte et activité de l’association',
        contenu: [
          'À compléter : présentation générale de l’UDAF 77, de ses missions de protection juridique des majeurs et de son organisation actuelle.',
        ],
      },
      {
        titre: 'Orientations stratégiques envisagées',
        contenu: [
          'À compléter : axes présentés par la direction (évolution de l’activité, organisation, ressources humaines, moyens).',
        ],
      },
      {
        titre: 'Conséquences prévisibles sur l’emploi et les métiers',
        contenu: ['À compléter : effectifs, compétences, organisation du travail concernés par ces orientations.'],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Cohérence du projet',
        level: 'Point de départ',
        text: 'À compléter : les orientations présentées sont-elles suffisamment précises et documentées ?',
      },
      {
        title: 'Impact sur l’emploi',
        level: 'À apprécier',
        text: 'À compléter : quelles conséquences prévisibles sur les postes, les métiers et les conditions de travail ?',
      },
      {
        title: 'Moyens et accompagnement',
        level: 'À préciser',
        text: 'À compléter : quels moyens sont annoncés pour accompagner la mise en œuvre de ces orientations ?',
      },
    ],
    questionDebattre:
      'À compléter : quelle question soumettre au débat collectif avant de décider d’un recours à l’expert ?',
  },
  {
    id: 'situation-economique-financiere-udaf77',
    slug: 'situation-economique-financiere-udaf77',
    title: 'Situation économique et financière — à venir',
    metaDescription: 'Scénario à venir.',
    subtype: 'situation-economique-financiere',
    disponible: false,
    structureFictive: { nom: 'UDAF 77 (cas fictif)', effectif: 'À compléter', activite: 'Protection juridique des majeurs' },
    accroche: '', sousTitre: '', chiffresCles: [], informationsTransmises: [], pointsAAnalyser: [], questionDebattre: '',
  },
  {
    id: 'politique-sociale-udaf77',
    slug: 'politique-sociale-udaf77',
    title: 'Politique sociale, conditions de travail et emploi — à venir',
    metaDescription: 'Scénario à venir.',
    subtype: 'politique-sociale',
    disponible: false,
    structureFictive: { nom: 'UDAF 77 (cas fictif)', effectif: 'À compléter', activite: 'Protection juridique des majeurs' },
    accroche: '', sousTitre: '', chiffresCles: [], informationsTransmises: [], pointsAAnalyser: [], questionDebattre: '',
  },
  {
    id: 'ponctuelle-generale-udaf77',
    slug: 'ponctuelle-generale-udaf77',
    title: 'Consultation ponctuelle — à venir',
    metaDescription: 'Scénario à venir.',
    subtype: 'ponctuelle-generale',
    disponible: false,
    structureFictive: { nom: 'UDAF 77 (cas fictif)', effectif: 'À compléter', activite: 'Protection juridique des majeurs' },
    accroche: '', sousTitre: '', chiffresCles: [], informationsTransmises: [], pointsAAnalyser: [], questionDebattre: '',
  },
  {
    id: 'pse-udaf77',
    slug: 'pse-udaf77',
    title: 'Licenciement collectif pour motif économique — à venir',
    metaDescription: 'Scénario à venir.',
    subtype: 'pse',
    disponible: false,
    structureFictive: { nom: 'UDAF 77 (cas fictif)', effectif: 'À compléter', activite: 'Protection juridique des majeurs' },
    accroche: '', sousTitre: '', chiffresCles: [], informationsTransmises: [], pointsAAnalyser: [], questionDebattre: '',
  },
  {
    id: 'risque-grave-udaf77',
    slug: 'risque-grave-udaf77',
    title: 'Risque grave (alerte santé/sécurité) — à venir',
    metaDescription: 'Scénario à venir.',
    subtype: 'risque-grave',
    disponible: false,
    structureFictive: { nom: 'UDAF 77 (cas fictif)', effectif: 'À compléter', activite: 'Protection juridique des majeurs' },
    accroche: '', sousTitre: '', chiffresCles: [], informationsTransmises: [], pointsAAnalyser: [], questionDebattre: '',
  },
];

export const findUdaf77Scenario = (slug: string) => udaf77Scenarios.find((scenario) => scenario.slug === slug);
