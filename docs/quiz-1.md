# Quiz 1

Quiz collectif piloté par le formateur, basé sur les diapositives 1 à 99 du support SSCT initial FORM OZ fourni. 25 QCM à réponse unique, sans noms, comptes participants, classement ni chronomètre. La carte de bibliothèque ouvre `/ateliers/quiz-1`.

## Animation

1. Créer une session. Conserver ce navigateur : un cookie HttpOnly protège ses commandes.
2. Afficher le QR code ou copier le lien dans Zoom. Les participants saisissent le code à six chiffres ou suivent le lien, puis appuient sur « Rejoindre ».
3. Lancer chaque question. Les choix s’enregistrent après « Envoyer ma réponse » et restent modifiables tant que la question est ouverte.
4. Fermer les réponses, puis révéler les résultats et l’explication. Passer à la question suivante.
5. Le bilan affiche les corrections révélées, un score privé pour chaque participant, et un export CSV des résultats collectifs pour le formateur. Une fin anticipée n’ajoute pas les questions non corrigées au score.

Les compteurs indiquent les inscriptions, pas les connexions actives. La capacité de protection est de 500 participants par session ; ce chiffre n’est pas une promesse de charge validée. Les tests automatisés couvrent 12 soumissions concurrentes. Une personne qui utilise plusieurs navigateurs est comptée plusieurs fois : ce quiz pédagogique ne vérifie pas les identités.

## Fonctionnement local

Node.js 22.13+ requis pour SQLite en développement. `npm ci`, puis `npm run dev`. La base SQLite `.quiz-data/quiz.sqlite` est créée automatiquement, hors Git. Elle persiste au redémarrage ; les navigateurs communiquent avec le même serveur. Ce n’est pas une simulation de synchronisation avec localStorage.

Si le port 3000 est occupé, utiliser `npm run dev -- --hostname 127.0.0.1 --port 3005`, puis `QUIZ_TEST_URL=http://127.0.0.1:3005 npm run test:quiz:http`.

Deux navigateurs distincts permettent d’essayer les rôles formateur et participant. L’adresse `127.0.0.1` n’est pas joignable par un téléphone distant : le QR de cet aperçu est explicitement signalé comme local.

## Hébergement public

Le quiz utilise le projet Supabase dédié `tatwin-ateliers-cse` (Paris), avec le schéma privé `quiz_private`. Le projet Vercel existant `cse-ateliers` est associé à `https://ateliers-cse.tatwin.fr`. Les fonctions sont configurées à Paris (`cdg1`). Aucun repli en mémoire ou en fichier temporaire n’est autorisé sur Vercel.

Configurer des variables serveur (jamais NEXT_PUBLIC) :

- `QUIZ_DATABASE_URL` : URL PostgreSQL, avec les paramètres TLS exigés par l’hébergeur. Connexion poolée compatible transactions possible ; prepared statements désactivés.
- `QUIZ_HOST_KEY` : secret long réservé aux formateurs, demandé lors de la création d’une session. Obligatoire en production.
- `QUIZ_PUBLIC_URL` : origine HTTPS publique canonique, par exemple `https://votre-domaine.fr`. Elle sert au QR code et au lien de participation.

Exécuter `npm run quiz:setup-db` une fois avec les variables du projet. Le script crée le schéma privé `quiz_private` et les deux tables dédiées ; il ne touche pas aux tables existantes. Ce schéma ne doit pas être exposé par une Data API. Le rôle serveur doit posséder les droits de lecture/écriture sur ces tables. Les clés de base et les jetons formateur ne sont jamais envoyés aux participants.

`npm run build` puis déploiement Next.js avec routes serveur. Un export statique ne suffit pas. Les clients consultent le serveur toutes les deux secondes ; aucune connexion WebSocket persistante n’est nécessaire. Sur un serveur Node unique avec disque durable, `QUIZ_ALLOW_LOCAL=1` autorise explicitement SQLite même en production ; ne pas utiliser ce mode pour un hébergement distribué. Cette option réserve également les cookies non sécurisés aux essais HTTP locaux : la production publique doit utiliser HTTPS et PostgreSQL.

## Sécurité, concurrence et durée de vie

- Jetons aléatoires de 256 bits en cookies HttpOnly, SameSite=Strict, Secure en production publique ; seul leur SHA-256 est stocké.
- Authentification des commandes, votes, états de session, QR et exports ; contrôles d’origine et taille maximale des requêtes (2 Ko).
- Pas de correction ni de banque complète dans le JavaScript participant ou les états avant révélation.
- Écriture atomique conditionnée par une révision (compare-and-swap). Les votes concurrents ne s’écrasent pas. Les commandes formateur vérifient aussi la phase et le numéro attendu pour éviter un double passage.
- Limitation persistante des tentatives de création et de participation. Les adresses IP ne sont pas enregistrées en clair ; les compteurs utilisent des empreintes temporaires.
- Sessions inaccessibles après 24 h ; nettoyage des enregistrements expirés à la prochaine activité du service (au plus une fois par minute). Pour une suppression physique à heure fixe même sans trafic, programmer la purge SQL. Suppression immédiate possible par le formateur.
- Retour automatique après une coupure réseau, tant que le cookie et la session existent. La perte du cookie formateur exige une nouvelle session.

## Contenu et vérifications

Les questions et sources sont dans `lib/quiz-1/questions.ts`. Relecture juridique au 18 septembre 2026 : Code du travail (L. 4121-1, L. 4121-2, L. 4122-1, L. 4131-1, L. 4132-1, L. 2317-1), INRS et Assurance Maladie. Les questions restent dans le périmètre des 99 premières diapositives. Les schémas du support ne sont pas reproduits.

Adaptations : aucun chiffre non daté ni ratio de coût supposé universel ; accident de mission distingué du trajet domicile-travail (diapo 27) ; les responsabilités ne sont pas présumées automatiquement ; le droit de retrait comprend l’alerte immédiate à l’employeur. Les 25 questions sont numérotées et ne sont pas mélangées.

- `npm run test:quiz` : transitions, corrections masquées, habilitations, doublons, scores et 25 questions.
- `npm run test:quiz:http` : avec un serveur local démarré (par défaut port 3000), tests HTTP avec cookies de 12 participants indépendants. Fournir `QUIZ_TEST_URL` et `QUIZ_HOST_KEY` si nécessaire. Les sessions de test sont supprimées en fin de test.
- `npm run build` et lint ciblé : compilation et conventions.

Les tests HTTP avec 12 participants ont été validés sur le backend Supabase. Après publication, vérifier également un QR sur un vrai téléphone via l’adresse HTTPS publique.
