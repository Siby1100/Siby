# Enhanced Google Classroom - Plateforme d'Apprentissage Collaboratif

## Description du Projet

Cette application est une version améliorée de Google Classroom, développée spécifiquement pour répondre aux besoins des projets tutorés en groupe. Elle offre des fonctionnalités avancées pour la gestion de groupes, le suivi de progression des projets, et une meilleure collaboration entre étudiants et enseignants.

## Fonctionnalités Principales

### Pour les Professeurs
- ✅ Créer et gérer des classes/modules
- ✅ Ajouter des étudiants par email
- ✅ Créer des groupes et désigner des coordinateurs
- ✅ Publier des annonces et partager de la documentation
- ✅ Assigner des tâches avec étapes de progression
- ✅ Corriger les travaux et joindre des fichiers de correction
- ✅ Suivre l'avancement des projets en temps réel
- ✅ Système de messagerie public/privé avancé

### Pour les Étudiants
- ✅ Rejoindre des cours par code
- ✅ Consulter la documentation et les ressources
- ✅ Travailler en groupe avec coordination
- ✅ Soumettre des travaux (coordinateur) et visualiser les soumissions (membres)
- ✅ Commenter et interagir avec les travaux du groupe
- ✅ Voir les corrections et fichiers joints du professeur
- ✅ Suivre la progression du projet par étapes
- ✅ Messagerie collaborative au sein du groupe

## Améliorations par rapport à Google Classroom

1. **Gestion de Groupes Avancée**: Création automatique de groupes avec désignation de coordinateurs
2. **Coordination des Soumissions**: Le coordinateur soumet au nom du groupe, les autres membres peuvent visualiser et commenter
3. **Système de Correction Enrichi**: Professeurs peuvent joindre des fichiers de correction directement dans l'application
4. **Suivi de Progression**: Visualisation claire des étapes du projet (soumission thème → validation → chapitres → soutenance → version finale)
5. **Messagerie Contextuelle**: Messages liés aux groupes et aux étapes du projet

## Technologies Utilisées

### Backend
- **Node.js** avec **Express.js**
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **Multer** pour la gestion des fichiers
- **Socket.io** pour les notifications en temps réel

### Frontend
- **React.js** avec **Hooks**
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Material-UI** pour l'interface utilisateur
- **Socket.io-client** pour les notifications

## Structure du Projet

```
enhanced-classroom/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── database/
    └── schema.sql
```

## Installation et Configuration

### Prérequis
- Node.js (v14+)
- MySQL (v8+)
- npm ou yarn

### Configuration Backend
```bash
cd backend
npm install
# Configurer la base de données dans config/database.js
npm run dev
```

### Configuration Frontend
```bash
cd frontend
npm install
npm start
```

## Étapes de Progression des Projets

1. **Soumission du thème**
2. **Validation du thème**
3. **Rédaction du chapitre 1**
4. **Chapitre 1 validé**
5. **Rédaction du chapitre 2**
6. **Chapitre 2 validé**
7. **Rédaction du chapitre 3**
8. **Chapitre 3 validé**
9. **Version provisoire**
10. **Diapo de présentation**
11. **Correction après soutenance**
12. **Version finale**

## Diagrammes UML

### Diagramme de Cas d'Utilisation
- Acteurs: Professeur, Étudiant Coordinateur, Étudiant Membre
- Cas d'usage: Gestion des classes, Gestion des groupes, Suivi de progression, Messagerie, etc.

### Diagramme de Classes
- Classes principales: User, Class, Group, Assignment, Submission, Message, ProgressStep, etc.

## Équipe de Développement

Ce projet a été développé dans le cadre de l'examen pratique du cours de développement web, en binôme/trinôme.

## Contact

Pour toute question ou suggestion, contactez: hamidoukass@gmail.com