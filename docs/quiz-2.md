# Quiz 2 — diapositives 101 à 226

30 questions à réponse unique, dans l’ordre pédagogique du support SSCT initial 50–299 FORMОZ. Lecture des textes et OCR des images des 126 diapositives, sans modification du PowerPoint.

## Couverture

- 1–3 : mandat, protection des élus et anciens élus (104–111).
- 4–6 : présidence, ordre du jour et procès-verbaux (123–134).
- 7–10 : référents harcèlement et votes (138–146).
- 11–17 : prévention, DUERP, inspections, enquêtes et DGI (158–171).
- 18–21 : consultations, BDESE et transformations du travail (163–187).
- 22–25 : expertises, financement et avis motivé (190–202).
- 26–27 : négociation collective, distinction avec la consultation et voies sans DS (203–210).
- 28–30 : règlement intérieur et CSSCT (211–226).

Chaque correction précise ses diapositives sources. Le quiz sélectionne les repères essentiels ; il ne pose pas une question sur chaque diapositive.

## Relecture juridique

Les formulations du support ne sont pas reproduites automatiquement. En particulier :

- Le financement de principe d’une expertise sur projet important est de 20 % CSE / 80 % employeur, avec les exceptions légales ; le risque grave relève du financement employeur intégral.
- Les abstentions restent des abstentions dans le PV : elles ne réduisent pas le nombre de membres présents servant au calcul de la majorité.
- La négociation sans DS dépend notamment du mandatement et des règles de validation. Le quiz ne reprend pas la règle générale erronée d’un référendum aux deux tiers pour toute négociation dans les entreprises d’au moins 50 salariés.
- La responsabilité de l’employeur n’est pas transférée au CSE. La CSSCT ne rend pas les avis du comité et ne décide pas de son recours à un expert.

Les liens officiels figurent dans les corrections concernées (Service Public, INRS, ministère du Travail et Légifrance). Aucune procédure propre à une entreprise n’est inventée.

## Fonctionnement

Route `/ateliers/quiz-2`, API `/api/quiz-2`. Même clé `QUIZ_HOST_KEY`, même base et schéma privé que Quiz 1 : aucun nouveau service ni compte participant.

Moteur partagé dans `lib/quiz-core/engine.ts`, banques de questions distinctes. La session contient `quizId` ; les sessions historiques sans ce champ restent des sessions Quiz 1. Les deux API refusent les codes de l’autre quiz avant toute lecture ou mutation. Les cookies, raccourcis de reprise, liens de participation, QR et exports sont propres à chaque quiz. Les numéros ne sont pas mélangés. Le style CSS est partagé.

## Vérification

`npm run test:quiz` teste les 25 questions de Quiz 1 et les 30 de Quiz 2, les corrections masquées, le pilotage et les scores.

Pour les parcours HTTP concurrents, fournir `QUIZ_TEST_URL`, `QUIZ_HOST_KEY` et `QUIZ_TEST_NUMBER=2` (ou `1` pour la non-régression). Les sessions de test sont supprimées à la fin.
