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
  structureFictive: { nom: string; effectif: string; activite: string };
  accroche: string;
  sousTitre: string;
  chiffresCles: ChiffreCle[];
  informationsTransmises: InformationBloc[];
  pointsAAnalyser: PointAAnalyser[];
  questionDebattre: string;
};

export const udaf77Scenarios: ConsultationScenario[] = [
  {
    id: 'orientations-strategiques',
    slug: 'orientations-strategiques',
    title: 'Consultation CSE — Orientations stratégiques',
    metaDescription:
      'Cas pratique pour rendre un avis sur les orientations stratégiques 2027-2029 d’une association de protection juridique des majeurs.',
    subtype: 'orientations-strategiques',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite:
        'Protection juridique des majeurs (tutelles, curatelles), mesures d’aide à la gestion du budget familial, information et soutien aux tuteurs familiaux',
    },
    accroche: 'Examiner les orientations stratégiques 2027-2029 de l’UDAF 77.',
    sousTitre:
      'Analysez le projet associatif et rendez un avis motivé sur ses conséquences prévisibles sur l’emploi et les métiers.',
    chiffresCles: [
      { label: 'Effectif', valeur: '92 salariés' },
      { label: 'Mesures suivies actuellement', valeur: '≈ 2 400' },
      { label: 'Hausse annuelle des mesures', valeur: '+18 %' },
      { label: 'Nouveau service prévu', valeur: 'Médiation familiale (secteur Meaux)' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'Le conseil d’administration présente le projet associatif 2027-2029, articulé autour de deux axes.',
          'Axe 1 — Absorption de la hausse des mesures confiées par les juges des tutelles (+18 % par an depuis 3 ans). Recrutement prévu de 6 mandataires judiciaires supplémentaires d’ici 2028, démarrage des recrutements au premier trimestre 2027.',
          'Axe 2 — Ouverture d’un service de médiation familiale sur le secteur de Meaux, actuellement non couvert par l’association. 3 postes de médiateurs familiaux à créer, ouverture de l’antenne prévue au troisième trimestre 2027.',
          'Financement : un appel à projets est déposé auprès de la CAF et une demande de subvention est en cours d’instruction auprès du conseil départemental. Les montants ne sont pas encore confirmés à la date de la présente consultation.',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Conséquences sur l’emploi et les métiers',
        level: 'Point de départ',
        text: 'Le calendrier de recrutement (6 postes d’ici 2028) est-il compatible avec le rythme de hausse des mesures (+18 %/an) ? Quel est le risque de dégradation de la charge de travail entre 2027 et l’arrivée effective des nouveaux mandataires ?',
      },
      {
        title: 'Financement non sécurisé',
        level: 'À surveiller',
        text: 'Le financement du service de médiation familiale (CAF, département) n’est pas confirmé. Que se passe-t-il si les subventions ne sont pas accordées : le projet est-il maintenu, réduit, reporté ?',
      },
      {
        title: 'Impact sur les équipes actuelles',
        level: 'À préciser',
        text: 'Quel accompagnement est prévu pour les équipes en place pendant la période de montée en charge et de recrutement ?',
      },
    ],
    questionDebattre:
      'Le calendrier de recrutement permet-il d’absorber la hausse des mesures sans dégrader la charge de travail actuelle ? Que se passe-t-il si le financement du service de médiation familiale n’est pas confirmé ?',
  },
  {
    id: 'situation-economique-financiere',
    slug: 'situation-economique-financiere',
    title: 'Consultation CSE — Situation économique et financière',
    metaDescription:
      'Cas pratique pour rendre un avis sur les comptes annuels d’une association de protection juridique des majeurs et sur un plan d’économies.',
    subtype: 'situation-economique-financiere',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite: 'Protection juridique des majeurs, mesures d’aide à la gestion du budget familial, médiation familiale',
    },
    accroche: 'Analyser les comptes et la situation financière de l’UDAF 77.',
    sousTitre:
      'Examinez l’écart entre le financement public des mesures et leur coût réel, et rendez un avis sur le plan d’économies proposé.',
    chiffresCles: [
      { label: 'Budget annuel', valeur: '≈ 5,1 M€' },
      { label: 'Couverture du coût réel par les indemnités de mesures', valeur: '92 %' },
      { label: 'Résultat de l’exercice', valeur: '-63 000 €' },
      { label: 'Mesures suivies', valeur: '≈ 2 400' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'Le trésorier présente les comptes annuels. L’indemnité forfaitaire versée par l’État (via la CAF) pour chaque mesure de protection ne couvre plus l’intégralité du coût de gestion (charges de personnel, déplacements, informatique). L’écart s’est creusé sur les 3 derniers exercices.',
          'Le dernier exercice se solde par un déficit de 63 000 €, après un exercice quasi à l’équilibre l’année précédente.',
          'Le trésorier propose un plan d’économies : report du remplacement d’un poste administratif vacant, et gel de certaines dépenses de formation. Aucune démarche de révision du financement auprès des tutelles publiques n’est mentionnée dans le document transmis.',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Origine du déficit',
        level: 'Point de départ',
        text: 'Le déficit est-il structurel (sous-financement chronique des mesures) ou conjoncturel ? Le document transmis permet-il de le déterminer ?',
      },
      {
        title: 'Impact du plan d’économies sur la charge de travail',
        level: 'À apprécier',
        text: 'Le poste administratif non remplacé va-t-il reporter des tâches sur les mandataires déjà en charge de nombreuses mesures ?',
      },
      {
        title: 'Alternatives non présentées',
        level: 'À vérifier',
        text: 'Une démarche de révision du financement auprès de l’État ou du conseil départemental a-t-elle été engagée avant de proposer des économies internes ?',
      },
    ],
    questionDebattre:
      'Le plan d’économies proposé (poste non remplacé, formations gelées) ne risque-t-il pas d’aggraver la charge de travail déjà tendue des mandataires ? Quelles démarches sont engagées pour obtenir un financement à la hauteur du coût réel des mesures ?',
  },
  {
    id: 'politique-sociale-conditions-travail-emploi',
    slug: 'politique-sociale-conditions-travail-emploi',
    title: 'Consultation CSE — Politique sociale, conditions de travail et emploi',
    metaDescription:
      'Cas pratique pour rendre un avis sur le bilan social et le plan de formation d’une association de protection juridique des majeurs.',
    subtype: 'politique-sociale',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite: 'Protection juridique des majeurs, mesures d’aide à la gestion du budget familial',
    },
    accroche: 'Examiner le bilan social et les conditions de travail à l’UDAF 77.',
    sousTitre: 'Analysez la charge de mesures par mandataire et le plan de formation, puis rendez un avis motivé.',
    chiffresCles: [
      { label: 'Effectif', valeur: '92 salariés' },
      { label: 'Charge moyenne par mandataire', valeur: '62 mesures' },
      { label: 'Seuil indicatif du secteur', valeur: '40 à 60 mesures' },
      { label: 'Évolution de l’absentéisme', valeur: '+2,1 points' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'La direction présente le bilan social annuel. La charge moyenne par mandataire s’établit à 62 mesures, au-dessus de la fourchette indicative de 40 à 60 mesures généralement observée dans le secteur (variable selon la nature des mesures : tutelle, curatelle, mesure d’aide à la gestion du budget familial).',
          'Le taux d’absentéisme a augmenté de 2,1 points sur l’exercice, principalement porté par des arrêts de courte durée.',
          'Le plan de formation proposé pour l’année à venir cible en priorité les nouveaux embauchés (droit des tutelles, logiciel métier). Aucune action n’est prévue sur la prévention des risques psychosociaux.',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Charge de travail au-delà du seuil indicatif',
        level: 'Point de départ',
        text: 'L’écart entre la charge moyenne (62) et le seuil indicatif du secteur (40-60) est-il expliqué et documenté par la direction ?',
      },
      {
        title: 'Lien entre absentéisme et charge de travail',
        level: 'À approfondir',
        text: 'Le document établit-il un lien entre la hausse de l’absentéisme et la charge de mesures, ou les deux sujets sont-ils traités séparément ?',
      },
      {
        title: 'Cohérence du plan de formation',
        level: 'À vérifier',
        text: 'L’absence d’action sur les RPS est-elle cohérente avec la hausse de l’absentéisme constatée par ailleurs dans le même bilan ?',
      },
    ],
    questionDebattre:
      'La hausse de l’absentéisme et le dépassement du seuil indicatif de charge par mandataire appellent-ils une action au-delà du plan de formation proposé ? Quelles mesures de prévention des risques psychosociaux demander ?',
  },
  {
    id: 'reorganisation-fusion-services',
    slug: 'reorganisation-fusion-services',
    title: 'Consultation CSE — Réorganisation des services',
    metaDescription: 'Cas pratique pour rendre un avis sur un projet de fusion de services et de fermeture d’une antenne locale.',
    subtype: 'ponctuelle-generale',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite: 'Protection juridique des majeurs, mesures d’aide à la gestion du budget familial',
    },
    accroche: 'Évaluer le projet de fusion des services MJPM et MASP.',
    sousTitre: 'Analysez les conséquences de la fermeture de l’antenne de Provins et de la centralisation des équipes au siège.',
    chiffresCles: [
      { label: 'Salariés concernés (antenne Provins)', valeur: '14' },
      { label: 'Postes supprimés annoncés', valeur: '0' },
      { label: 'Allongement de trajet le plus important', valeur: '+45 km/jour' },
      { label: 'Mise en œuvre envisagée', valeur: 'Dans 4 mois' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'La direction présente un projet de fusion du pôle « protection juridique des majeurs » (MJPM) et du service « mesures d’aide à la gestion du budget familial » (MASP), avec fermeture de l’antenne de Provins (14 salariés) et centralisation des équipes au siège de Melun.',
          'L’employeur indique qu’aucun poste ne sera supprimé, les salariés de Provins étant appelés à rejoindre le siège. Aucune information n’est fournie sur une éventuelle compensation des trajets domicile-travail allongés, ni sur le calendrier détaillé de transfert des dossiers de mesures en cours.',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Précision de la garantie sur l’emploi',
        level: 'Point de départ',
        text: '« Aucun poste supprimé » — la note précise-t-elle si les salariés retrouveront les mêmes fonctions et le même niveau au siège ?',
      },
      {
        title: 'Conditions de travail',
        level: 'À surveiller',
        text: 'L’allongement des trajets (jusqu’à 45 km/jour) est-il compensé ? Aucune mesure n’est mentionnée dans le document transmis.',
      },
      {
        title: 'Continuité du suivi des mesures',
        level: 'À préciser',
        text: 'Quel calendrier et quelles garanties pour éviter une rupture de suivi des majeurs protégés pendant le transfert des dossiers ?',
      },
    ],
    questionDebattre:
      'Le dossier remis permet-il d’apprécier réellement l’absence de suppression de poste, sans préciser les fonctions proposées à chacun ? Quelles compensations demander pour l’allongement des trajets, et quel calendrier de transfert des dossiers pour garantir la continuité du suivi des majeurs protégés ?',
  },
  {
    id: 'nouveau-logiciel-teletravail',
    slug: 'nouveau-logiciel-teletravail',
    title: 'Consultation CSE — Nouvelles technologies et télétravail',
    metaDescription:
      'Cas pratique pour rendre un avis sur le déploiement d’un nouveau logiciel métier et l’ouverture du télétravail partiel.',
    subtype: 'ponctuelle-generale',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite: 'Protection juridique des majeurs, mesures d’aide à la gestion du budget familial',
    },
    accroche: 'Étudier le déploiement d’un nouveau logiciel métier et le télétravail partiel associé.',
    sousTitre: 'Analysez les conséquences sur les conditions de travail et sur la confidentialité des données des majeurs protégés.',
    chiffresCles: [
      { label: 'Salariés concernés', valeur: '92' },
      { label: 'Télétravail proposé', valeur: '2 jours/semaine (fonctions administratives)' },
      { label: 'Bascule du logiciel', valeur: 'Dans 6 mois' },
      { label: 'Formation prévue', valeur: '2 jours par salarié' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'L’UDAF 77 prévoit de remplacer son logiciel métier de gestion des mesures de protection par une nouvelle solution, avec dématérialisation progressive des dossiers.',
          'En parallèle, un télétravail partiel (2 jours/semaine) serait ouvert aux fonctions administratives et de coordination, à l’exclusion des mandataires en contact direct et régulier avec les majeurs protégés.',
          'La note ne détaille pas les modalités de sécurisation des données sensibles (informations médicales, financières, familiales des majeurs protégés) en situation de télétravail, ni le protocole de bascule des dossiers en cours entre les deux logiciels.',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Formation et accompagnement',
        level: 'Point de départ',
        text: '2 jours de formation sont-ils suffisants au regard du changement d’outil pour l’ensemble des métiers concernés ?',
      },
      {
        title: 'Confidentialité des données',
        level: 'Sensible',
        text: 'Quelles garanties techniques et organisationnelles pour les dossiers de majeurs protégés consultés en télétravail ?',
      },
      {
        title: 'Continuité pendant la bascule',
        level: 'À préciser',
        text: 'Quel protocole pour éviter la perte ou l’indisponibilité de dossiers en cours pendant la migration vers le nouveau logiciel ?',
      },
    ],
    questionDebattre:
      'Les modalités de sécurisation des données sensibles en télétravail sont-elles suffisamment précisées pour rendre un avis ? Le calendrier de bascule (6 mois) est-il réaliste au regard du volume de dossiers à migrer ?',
  },
  {
    id: 'reglement-interieur-teletravail',
    slug: 'reglement-interieur-teletravail',
    title: 'Consultation CSE — Révision du règlement intérieur (télétravail)',
    metaDescription:
      'Cas pratique pour rendre un avis sur un projet de règlement intérieur encadrant le télétravail avant transmission à l’inspection du travail.',
    subtype: 'ponctuelle-generale',
    structureFictive: {
      nom: 'UDAF 77',
      effectif: '92 salariés',
      activite: 'Protection juridique des majeurs, mesures d’aide à la gestion du budget familial',
    },
    accroche: 'Rendre un avis sur les nouvelles règles encadrant le télétravail et les dossiers dématérialisés.',
    sousTitre: 'Examinez le projet de modification du règlement intérieur avant sa transmission à l’inspection du travail.',
    chiffresCles: [
      { label: 'Salariés concernés par le télétravail', valeur: '38' },
      { label: 'Clause de réversibilité', valeur: 'Non précisée dans le projet' },
      { label: 'Sanctions en cas de manquement', valeur: 'Prévues, sans distinction volontaire/involontaire' },
      { label: 'Transmission à l’inspection du travail', valeur: 'Dans 3 semaines' },
    ],
    informationsTransmises: [
      {
        titre: 'Note d’information transmise par l’employeur',
        contenu: [
          'Le projet de modification du règlement intérieur est transmis pour avis avant envoi à l’inspection du travail. Le texte introduit des règles de sécurité informatique pour l’accès aux dossiers dématérialisés depuis le domicile (VPN obligatoire, interdiction d’impression, verrouillage automatique de session), assorties de sanctions disciplinaires en cas de manquement.',
          'Le projet ne précise ni clause de réversibilité du télétravail (possibilité d’y renoncer et de revenir en présentiel), ni procédure contradictoire distincte en cas de sanction liée à un manquement informatique — qui peut être involontaire (bug, coupure réseau, erreur de manipulation).',
        ],
      },
    ],
    pointsAAnalyser: [
      {
        title: 'Clarté des obligations de sécurité',
        level: 'Point de départ',
        text: 'Les obligations (VPN, verrouillage automatique) sont-elles suffisamment définies pour être appliquées et contrôlées de manière équitable ?',
      },
      {
        title: 'Absence de clause de réversibilité',
        level: 'À compléter',
        text: 'Un salarié peut-il renoncer au télétravail et revenir en présentiel ? Selon quelles modalités et quel délai ?',
      },
      {
        title: 'Proportionnalité des sanctions',
        level: 'À vérifier',
        text: 'La procédure disciplinaire distingue-t-elle un manquement volontaire d’un incident technique involontaire ?',
      },
    ],
    questionDebattre:
      'Le projet de règlement intérieur garantit-il une application équitable des sanctions en cas de manquement informatique, y compris involontaire ? Faut-il demander l’ajout d’une clause de réversibilité du télétravail avant transmission à l’inspection du travail ?',
  },
];

export const findUdaf77Scenario = (slug: string) => udaf77Scenarios.find((scenario) => scenario.slug === slug);
