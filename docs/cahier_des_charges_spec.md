<USER_REQUEST>
# MISSION GLOBALE — FINALISATION ET DÉVELOPPEMENT DU SME MARSA MAROC

Tu es chargé d'agir comme une équipe complète composée d'un architecte logiciel, d'un développeur Full-Stack senior, d'un ingénieur en systèmes énergétiques et d'un spécialiste des systèmes industriels.

Ta mission est de reprendre le projet existant et de réaliser tout le travail de développement restant pour obtenir une application web professionnelle, cohérente, fonctionnelle et testable.

# 1. CONTEXTE DU PROJET

**Nom : MARSA MAROC — PORT ENERGY INTELLIGENCE**

**Projet :** Système de Monitoring Énergétique (SME) des postes électriques du Port d'Agadir.

**Maître d'ouvrage :** Marsa Maroc — Direction d'Exploitation au Port d'Agadir (DEPA).

**Référence du marché :** 12/DEPA/2026.

Le système doit permettre de surveiller les six postes électriques, d'acquérir automatiquement les mesures des compteurs communicants, de suivre les performances énergétiques conformément aux objectifs d'ISO 50001:2018, de gérer les alertes et de produire des rapports énergétiques.

La spécification fonctionnelle et technique que je t'ai communiquée constitue la référence principale de ton travail.

# 2. CONSIGNE D'AUTONOMIE — TRAVAIL SANS INTERRUPTION

Je souhaite que tu réalises cette mission de manière autonome, sans me demander une validation après chaque étape.

* Ne demande pas de permission pour chaque commande, lecture, création ou modification de fichier.
* Ne m'interromps pas pour confirmer les opérations courantes de développement.
* Organise toi-même les tâches et exécute-les dans un ordre logique.
* Installe les dépendances nécessaires, configure l'environnement et exécute les commandes de développement, de compilation et de test.
* Corrige automatiquement les erreurs rencontrées et relance les tests.
* Prends les décisions techniques raisonnables nécessaires à l'avancement.
* En cas de choix technique non imposé par le cahier des charges, choisis la solution la plus cohérente et documente cette décision.
* Ne sollicite mon intervention que lorsqu'une information externe indispensable manque réellement, lorsqu'un secret ou identifiant doit être fourni, ou lorsqu'une opération destructive ou présentant un risque important exige une intervention humaine.

Utilise les autorisations déjà disponibles pour les opérations courantes. Si une autorisation permanente limitée à une catégorie de commandes sûres est disponible, privilégie-la plutôt que de redemander la même autorisation à chaque exécution. Ne contourne pas les mécanismes de sécurité.

**Objectif : avancer jusqu'à obtenir une version fonctionnelle complète, et non simplement produire des propositions ou des maquettes.**

# 3. CONTINUITÉ DU PROJET ET IDENTITÉ VISUELLE

Commence par examiner le projet et son code existant.

Conserve les éléments visuels et techniques déjà développés lorsqu'ils sont pertinents :

* Design Hybrid Intelligence.
* Identité visuelle industrielle et portuaire.
* Thème sombre professionnel.
* Logo Marsa Maroc existant, sous réserve de son authenticité.
* Jumeau numérique illustratif du Port d'Agadir.
* Synoptique électrique.
* Navigation et composants React existants.
* Animations et visualisations pertinentes.

Ne reconstruis pas inutilement ce qui fonctionne déjà.

Ne remplace pas l'identité visuelle par un dashboard SaaS générique.

L'application doit être moderne, immersive, élégante et adaptée à un environnement industriel.

Utilise :

* Bleu marine profond.
* Cyan électrique.
* Bleu institutionnel Marsa Maroc.
* Orange pour les avertissements.
* Rouge pour les anomalies critiques.
* Vert pour les états normaux.
* Typographie lisible.
* Graphiques techniques avec unités physiques.

L'interface doit être entièrement en français et conçue pour être responsive.

# 4. DÉVELOPPEMENT DES SIX MODULES FONCTIONNELS

Développe réellement les fonctionnalités suivantes, avec des interactions opérationnelles et des données persistantes.

## MODULE 01 — TABLEAU DE BORD ET SUPERVISION ÉNERGÉTIQUE

Développer un tableau de bord général permettant :

* D'afficher le périmètre énergétique du Port d'Agadir.
* De visualiser les six postes électriques.
* De consulter l'état de fonctionnement de chaque poste.
* De consulter les mesures énergétiques disponibles.
* D'afficher les puissances actives et réactives, tensions, courants, cosφ et énergies lorsque ces grandeurs sont configurées.
* De visualiser les courbes de consommation.
* De filtrer par poste, compteur, grandeur et période.
* De comparer les consommations entre postes.
* De consulter les historiques.
* D'afficher la date et l'heure de la dernière mesure.
* De signaler les données anciennes ou absentes.

Prévoir des vues journalières, hebdomadaires, mensuelles et personnalisées.

Les six postes doivent être configurables dans l'administration.

Ne crée pas de caractéristiques techniques fictives présentées comme réelles.

Le jumeau numérique et le synoptique doivent rester des représentations illustratives tant que la topologie réelle n'est pas confirmée.

## MODULE 02 — GESTION DES COMPTEURS ET ACQUISITION MODBUS TCP/IP

Développer une véritable architecture de gestion et d'acquisition des compteurs.

Fonctionnalités :

* Création, modification et désactivation des compteurs.
* Association à un poste électrique.
* Gestion des points de comptage.
* Fabricant et modèle.
* Adresse IP et port.
* Identifiant Modbus.
* Configuration du protocole.
* Configuration des registres.
* Types de données.
* Fonctions de lecture.
* Facteurs d'échelle.
* Unités.
* Périodes d'acquisition configurables.
* Délais de communication et reconnexion.
* Test de communication.
* Affichage de la dernière communication.
* Gestion des erreurs et des indisponibilités.

Implémente un service d'acquisition Python indépendant du frontend.

Utilise une bibliothèque Modbus adaptée, par exemple PyModbus, en vérifiant sa version et son API.

La cartographie des registres doit être configurable et documentée.

Ne code jamais en dur des registres non confirmés.

Prévois deux modes :

1. Mode simulation : génération de mesures cohérentes pour les tests.
2. Mode réel : connexion aux compteurs configurés, lorsque les équipements et leurs paramètres sont disponibles.

Le mode simulation doit être clairement identifiable.

Le système doit conserver les mesures brutes, les unités, les horodatages et la qualité de lecture.

Prévois une gestion des interruptions, des reprises de collecte et de la prévention des doublons.

L'intégration des compteurs existants doit être possible sans double comptage.

## MODULE 03 — INDICATEURS DE PERFORMANCE ÉNERGÉTIQUE (IPE) ET SER

Développer un moteur de calcul énergétique.

Gestion des IPE :

* Création et modification des indicateurs.
* Nom et description.
* Formule documentée.
* Grandeurs sources.
* Unités.
* Périmètre énergétique.
* Période d'agrégation.
* Date d'entrée en vigueur.
* Historique des modifications.
* Calcul automatique à partir des mesures disponibles.
* Historisation des résultats.
* Visualisation des tendances.

Gestion de la SER :

* Création d'une période de référence.
* Enregistrement des données de référence.
* Documentation des hypothèses.
* Variables pertinentes.
* Méthodes de calcul configurables.
* Comparaison entre consommation observée et référence.
* Visualisation des écarts.
* Gestion de plusieurs versions de la SER.
* Traçabilité des modifications.

IMPORTANT :

N'invente aucune formule officielle d'IPE ni aucune méthode de normalisation de la SER.

Prévois un moteur générique configurable et des exemples clairement identifiés comme démonstratifs.

Les paramètres définitifs devront pouvoir être validés par le responsable énergie de la DEPA.

## MODULE 04 — ALERTES ET INCIDENTS

Développer un véritable système d'alertes.

Prévoir des règles configurables concernant :

* Perte de communication avec un compteur.
* Absence de données.
* Données invalides.
* Dépassement d'un seuil.
* Anomalie de mesure.
* Écart énergétique significatif.
* Anomalie d'un IPE lorsque les règles sont définies.

Chaque alerte doit comporter :

* Identifiant.
* Type.
* Équipement concerné.
* Date et heure.
* Valeur observée.
* Seuil ou règle déclenchée.
* Niveau de priorité.
* Statut.
* Commentaires.
* Historique des actions.

Prévoir les statuts :

* Nouvelle.
* Prise en charge.
* Clôturée.

Développer une interface de consultation, de filtrage et de traitement des incidents.

Les seuils doivent être paramétrables.

Ne considère pas les seuils de démonstration comme des seuils contractuels.

## MODULE 05 — REPORTING ET ANALYTICS

Développer un module complet d'analyse et de reporting.

Fonctionnalités :

* Synthèse des consommations.
* Comparaison entre les six postes.
* Analyse des puissances.
* Courbes historiques.
* Suivi des IPE.
* Comparaison avec la SER.
* Analyse des alertes.
* Qualité et complétude des données.
* Filtrage par période et périmètre.
* Export des mesures.
* Génération de rapports.

Prévoir des exports CSV et Excel ainsi que des rapports PDF.

Chaque rapport doit indiquer :

* Le périmètre étudié.
* La période analysée.
* Les grandeurs et unités.
* Les indicateurs utilisés.
* La qualité et la provenance des données.
* Les éventuelles données manquantes.

Ne génère pas de résultats énergétiques non vérifiables.

## MODULE 06 — ADMINISTRATION, UTILISATEURS ET AUDIT LOG

Développer une administration fonctionnelle.

Prévoir les rôles suivants comme configuration initiale modifiable :

* Administrateur technique.
* Responsable énergie.
* Exploitant / opérateur.
* Lecteur / auditeur.

Fonctionnalités :

* Authentification.
* Gestion des utilisateurs.
* Gestion des rôles et permissions.
* Gestion des six postes.
* Gestion des compteurs.
* Gestion des paramètres d'acquisition.
* Gestion des IPE et de la SER.
* Gestion des règles d'alerte.
* Configuration générale.

Développer un Audit Log enregistrant les actions sensibles :

* Utilisateur.
* Action.
* Élément concerné.
* Ancienne valeur.
* Nouvelle valeur lorsque pertinent.
* Date et heure.

Les permissions doivent respecter le principe du moindre privilège.

Ne stocke jamais les mots de passe en clair.

# 5. ARCHITECTURE BACKEND ET BASE DE DONNÉES

Mets en place une architecture réellement exploitable.

Architecture recommandée :

**Frontend**

* React.
* TypeScript.
* Vite.
* Tailwind CSS.
* Bibliothèque de graphiques adaptée.

**Backend**

* Python.
* FastAPI.
* API REST.
* WebSocket pour les mises à jour de télémétrie.
* Pydantic pour la validation.
* SQLAlchemy ou solution équivalente.

**Base de données**

* PostgreSQL.
* TimescaleDB si compatible avec l'environnement.
* Stockage des mesures et séries temporelles.
* Relations entre les postes, compteurs, points de comptage et mesures.
* Historisation des paramètres.
* Sauvegarde et restauration documentées.

**Acquisition**

* Service Modbus TCP/IP indépendant.
* Gestion des connexions.
* Validation des lectures.
* Horodatage.
* Gestion des erreurs.
* Reconnexion.
* Reprise après interruption.

Utilise Docker Compose si cela facilite le déploiement et la reproductibilité.

Si TimescaleDB n'est pas disponible dans l'environnement actuel, prévois une solution PostgreSQL compatible et documente la possibilité d'activer TimescaleDB ultérieurement.

Ne simule pas une base de données en utilisant uniquement des tableaux JavaScript.

Les données importantes doivent être persistantes.

# 6. QUALITÉ ET FIABILITÉ DES DONNÉES

C'est une exigence fondamentale.

Chaque mesure doit comporter au minimum :

* Identifiant du point de comptage.
* Grandeur.
* Valeur.
* Unité.
* Horodatage de mesure.
* Horodatage de réception.
* Source.
* Statut de qualité.

Distingue clairement :

* REAL : donnée réelle issue d'un équipement.
* SIMULATED : donnée générée par simulation.
* ESTIMATED : donnée estimée.
* MISSING : donnée absente.
* INVALID : donnée invalide.
* COMMUNICATION_ERROR : erreur de communication.

Une valeur égale à zéro ne doit jamais être confondue avec une donnée absente.

Une mesure ancienne ne doit jamais être présentée comme une mesure instantanée.

Les agrégations énergétiques doivent éviter les doubles comptages.

Les données calculées doivent rester distinguées des données brutes.

# 7. SÉCURITÉ ET FIABILITÉ LOGICIELLE

Mettre en œuvre :

* Authentification sécurisée.
* Gestion des sessions ou des jetons.
* Contrôle des permissions côté backend.
* Validation des données entrantes.
* Protection des secrets.
* Configuration par variables d'environnement.
* Journalisation technique.
* Audit des actions sensibles.
* Gestion des erreurs.
* Sauvegardes documentées.
* Synchronisation horaire lorsque possible.

Ne prétends pas que Modbus TCP/IP est sécurisé nativement.

Documente les mesures nécessaires de segmentation réseau et de protection des communications.

# 8. STRUCTURE ET ORGANISATION DU CODE

Organise le projet de façon modulaire.

Sépare clairement :

* Frontend.
* Backend.
* API.
* Services métier.
* Acquisition Modbus.
* Modèles de données.
* Schémas de validation.
* Calculs énergétiques.
* Alertes.
* Reporting.
* Authentification.
* Tests.
* Documentation.
* Configuration et déploiement.

Évite les composants monolithiques et le code dupliqué.

Utilise des noms explicites et une architecture facile à maintenir.

# 9. TESTS ET VALIDATION

Ne te limite pas à vérifier que l'application s'affiche.

Effectue des tests réels sur les fonctionnalités développées.

Prévoir notamment :

* Test des API.
* Test de connexion et de lecture Modbus avec simulateur.
* Test des conversions et facteurs d'échelle.
* Test de l'horodatage.
* Test de la qualité des données.
* Test des agrégations énergétiques.
* Test des calculs IPE.
* Test des comparaisons SER.
* Test des alertes.
* Test des permissions.
* Test des exports.
* Test de persistance après redémarrage.
* Test de compilation frontend.
* Test du démarrage backend.

Corrige les erreurs jusqu'à obtenir une version stable.

Ne déclare jamais un test réussi s'il n'a pas réellement été exécuté.

# 10. DONNÉES DE DÉMONSTRATION

Crée un environnement de démonstration permettant de présenter l'application même en l'absence des compteurs physiques.

Il doit contenir :

* Six postes électriques configurables.
* Des compteurs fictifs clairement identifiés.
* Des mesures simulées cohérentes.
* Des historiques de consommation.
* Quelques alertes de démonstration.
* Des exemples d'IPE.
* Un exemple de SER.
* Des utilisateurs correspondant aux rôles prévus.

Toutes les données fictives doivent être explicitement marquées comme simulées.

Ne présente aucune valeur fictive comme une donnée officielle de Marsa Maroc.

Les données de démonstration doivent pouvoir être réinitialisées.

# 11. DOCUMENTATION ET LIVRABLES

Crée ou mets à jour les documents suivants :

1. README.md : installation et démarrage.
2. ARCHITECTURE.md : architecture technique.
3. DATABASE.md : modèle de données.
4. MODBUS.md : configuration des compteurs et registres.
5. ENERGY_INDICATORS.md : fonctionnement des IPE et de la SER.
6. SECURITY.md : sécurité et gestion des accès.
7. TESTS.md : tests exécutés et résultats.
8. DEPLOYMENT.md : déploiement et configuration.
9. ASSUMPTIONS.md : hypothèses et informations à confirmer auprès de la DEPA.

Documente également les identifiants de démonstration si des comptes de démonstration sont créés, sans utiliser de véritables identifiants personnels.

# 12. CONDITIONS FINALES DE RÉUSSITE

Je ne veux pas seulement une interface graphique avec des boutons non fonctionnels.

Je veux une application structurée, avec :

* Un frontend fonctionnel.
* Un backend opérationnel.
* Une base de données persistante.
* Une API exploitable.
* Un service d'acquisition Modbus avec mode simulation et possibilité de connexion réelle.
* Six modules interconnectés.
* Des calculs énergétiques traçables.
* Des alertes persistantes.
* Des exports fonctionnels.
* Une authentification et des permissions.
* Des tests exécutés.
* Une documentation technique.

Conserve le travail déjà réalisé et complète les fonctionnalités manquantes.

Ne supprime pas les composants existants sans raison technique.

Ne prétends pas que les équipements physiques du Port d'Agadir sont connectés si nous travaillons encore en simulation.

Ne demande pas de validation à chaque étape.

**Commence maintenant par examiner le projet existant, puis réalise les développements restants dans l'ordre technique le plus pertinent. Continue jusqu'à obtenir une version complète et testée.**

À la fin, fournis un rapport concis indiquant :

* Les fonctionnalités réellement développées.
* Les technologies utilisées.
* Les tests exécutés et leurs résultats.
* Les commandes de démarrage.
* L'adresse locale de l'application.
* Les éventuelles fonctionnalités encore dépendantes d'informations ou d'équipements réels de la DEPA.

Ta priorité est de livrer un système fonctionnel, fiable, professionnel et fidèle à la spécification du SME.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-03T20:29:00Z.
</ADDITIONAL_METADATA>