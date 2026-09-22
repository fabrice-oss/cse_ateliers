// Source unique de vérité pour les règles légales des consultations obligatoires UDAF 77.
// Rien de juridique ne doit être dupliqué dans le contenu des scénarios : ils référencent un subtype défini ici.

export type ConsultationSubtype =
  | 'orientations-strategiques'
  | 'situation-economique-financiere'
  | 'politique-sociale'
  | 'ponctuelle-generale'
  | 'pse'
  | 'risque-grave';

export type ConsultationCategory = 'recurrente' | 'ponctuelle';

export type ConsultationLegalRule = {
  subtype: ConsultationSubtype;
  label: string;
  category: ConsultationCategory;
  delaiSimpleMois: number;
  delaiAvecExpertiseMois: number;
  financementExpert: { employeurPct: number; csePct: number };
  articleDelai: { label: string; url: string };
  articleExpertise: { label: string; url: string };
  notePeutSaisirJuge: string;
};

const notePeutSaisirJuge =
  'Si les informations transmises restent insuffisantes, le CSE peut saisir le président du tribunal judiciaire pour qu’il ordonne à l’employeur de les communiquer. Cette saisine ne prolonge pas le délai de consultation, sauf décision contraire du juge.';

const articleDelai = {
  label: 'Code du travail, article L. 2312-15',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033024699',
};

const articleExpertise = {
  label: 'Code du travail, article L. 2315-78',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035609426',
};

export const consultationLegalRules: Record<ConsultationSubtype, ConsultationLegalRule> = {
  'orientations-strategiques': {
    subtype: 'orientations-strategiques',
    label: 'Orientations stratégiques',
    category: 'recurrente',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 80, csePct: 20 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
  'situation-economique-financiere': {
    subtype: 'situation-economique-financiere',
    label: 'Situation économique et financière',
    category: 'recurrente',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 100, csePct: 0 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
  'politique-sociale': {
    subtype: 'politique-sociale',
    label: 'Politique sociale, conditions de travail et emploi',
    category: 'recurrente',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 100, csePct: 0 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
  'ponctuelle-generale': {
    subtype: 'ponctuelle-generale',
    label: 'Consultation ponctuelle (réorganisation, nouvelles technologies, règlement intérieur…)',
    category: 'ponctuelle',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 80, csePct: 20 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
  pse: {
    subtype: 'pse',
    label: 'Licenciement collectif pour motif économique (PSE)',
    category: 'ponctuelle',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 100, csePct: 0 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
  'risque-grave': {
    subtype: 'risque-grave',
    label: 'Risque grave (alerte santé/sécurité)',
    category: 'ponctuelle',
    delaiSimpleMois: 1,
    delaiAvecExpertiseMois: 2,
    financementExpert: { employeurPct: 100, csePct: 0 },
    articleDelai,
    articleExpertise,
    notePeutSaisirJuge,
  },
};

export const consultationSubtypeOrder: ConsultationSubtype[] = [
  'orientations-strategiques',
  'situation-economique-financiere',
  'politique-sociale',
  'ponctuelle-generale',
  'pse',
  'risque-grave',
];

export const categoryLabel: Record<ConsultationCategory, string> = {
  recurrente: 'Consultation récurrente',
  ponctuelle: 'Consultation ponctuelle',
};
