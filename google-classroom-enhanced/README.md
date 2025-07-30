# Google Classroom Enhanced

## Description

Google Classroom Enhanced est une application web développée dans le cadre du projet tutoré GL3 pour répondre aux limitations observées dans la version gratuite de Google Classroom. Cette application vise à améliorer la gestion des projets tutorés en offrant des fonctionnalités spécialisées pour les étudiants et les enseignants.

## Cahier des Charges

Cette application répond aux besoins identifiés suivants :

- ✅ **Gestion des groupes** : Possibilité de mettre les étudiants en groupe et désigner un coordinateur
- ✅ **Système de soumission de groupe** : Le coordinateur peut soumettre au nom du groupe
- ✅ **Interaction collaborative** : Les membres du groupe peuvent voir et interagir avec les soumissions
- ✅ **Système de correction avancé** : Le professeur peut joindre des fichiers de correction
- ✅ **Suivi de progression** : Visualisation de l'état d'avancement du projet en grandes étapes

## Fonctionnalités Principales

### Pour les Professeurs
- Créer et gérer des classes/modules
- Former des groupes et désigner des coordinateurs
- Assigner des tâches et devoirs
- Corriger les travaux avec fichiers joints
- Suivre la progression des projets en temps réel
- Envoyer des messages publics et privés
- Publier des annonces
- Partager des documents et templates

### Pour les Étudiants
- Rejoindre des classes via un code
- Participer aux groupes de projet
- Soumettre des travaux (coordinateur)
- Consulter les corrections et feedback
- Suivre la progression de leur projet
- Communiquer avec le professeur et les pairs
- Accéder aux documents partagés

## Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Material-UI (MUI)** pour l'interface utilisateur
- **React Router** pour la navigation
- **Axios** pour les appels API
- **date-fns** pour la gestion des dates

### Backend (Simulation)
- **JSON Server** pour simuler une API REST
- Base de données JSON avec entités complètes

### Structure des Données

La base de données comprend les entités suivantes :
- **Users** : Utilisateurs (professeurs et étudiants)
- **Classes** : Classes/modules de cours
- **Groups** : Groupes de projet avec coordinateurs
- **Assignments** : Devoirs et tâches
- **Submissions** : Soumissions des étudiants
- **ProjectProgress** : Suivi de progression des projets
- **Messages** : Système de messagerie
- **Announcements** : Annonces
- **Documents** : Fichiers partagés
- **Corrections** : Corrections des professeurs

## Installation et Lancement

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone [URL_DU_REPO]
cd google-classroom-enhanced

# Installer les dépendances
npm install
```

### Lancement en développement
```bash
# Démarrer le serveur JSON et l'application React en parallèle
npm run dev

# Ou séparément :
# Terminal 1 - Serveur JSON (port 3001)
npm run server

# Terminal 2 - Application React (port 3000)
npm start
```

### Accès à l'application
- **Application** : http://localhost:3000
- **API JSON Server** : http://localhost:3001

## Comptes de Démonstration

### Professeur
- **Email** : hamidou.kassogue@prof.com
- **Mot de passe** : password123

### Étudiants
- **Marie Dupont** : etudiant1@gl3.com / password123
- **Jean Martin** : etudiant2@gl3.com / password123
- **Sophie Bernard** : etudiant3@gl3.com / password123
- **Pierre Moreau** : etudiant4@gl3.com / password123

## Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Layout/         # Layout principal et navigation
│   └── Login.tsx       # Composant de connexion
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Gestion de l'authentification
├── pages/              # Pages principales
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── Groups.tsx      # Gestion des groupes
│   └── Progress.tsx    # Suivi de progression
├── services/           # Services API
│   └── api.ts          # Appels vers JSON Server
├── types/              # Types TypeScript
│   └── index.ts        # Définitions des interfaces
└── App.tsx             # Composant principal
```

## Étapes de Progression des Projets

Le système suit les étapes suivantes pour chaque projet :

1. **Soumission du thème**
2. **Validation du thème**
3. **Rédaction du chapitre 1**
4. **Chapitre 1 OK**
5. **Rédaction du chapitre 2**
6. **Chapitre 2 OK**
7. **Rédaction du chapitre 3**
8. **Chapitre 3 OK**
9. **Version provisoire**
10. **Diapo de présentation**
11. **Correction après soutenance**
12. **Version finale**

## Améliorations par rapport à Google Classroom

1. **Gestion native des groupes** avec désignation de coordinateurs
2. **Système de progression visuel** avec étapes prédéfinies
3. **Soumissions de groupe** gérées par les coordinateurs
4. **Corrections avec fichiers joints** directement dans l'application
5. **Interface spécialisée** pour les projets tutorés
6. **Statistiques et rapports** de progression
7. **Communication contextuelle** liée aux projets

## Développement Futur

- [ ] Système de notifications en temps réel
- [ ] Upload et gestion de fichiers
- [ ] Exportation de rapports PDF
- [ ] Intégration avec des outils externes (Git, Drive, etc.)
- [ ] Mode hors ligne
- [ ] Application mobile

## Équipe de Développement

Projet développé dans le cadre du cours GL3 - Projet Tutoré sous la supervision de Dr. Hamidou KASSOGUE.

## Licence

Ce projet est développé à des fins éducatives dans le cadre du programme de Génie Logiciel.

---

**Note** : Cette application est un prototype éducatif utilisant JSON Server pour la simulation de l'API. Pour un déploiement en production, il serait nécessaire d'implémenter un véritable backend avec base de données.
