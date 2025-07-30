# Enhanced Google Classroom - Installation Guide

## Vue d'ensemble

Enhanced Google Classroom est une plateforme d'apprentissage collaboratif avec des fonctionnalités avancées de gestion de groupes et de suivi de progression. Cette application comprend un backend Node.js/Express avec MySQL et un frontend React.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 14.0 ou supérieure)
- **npm** ou **yarn**
- **MySQL** (version 8.0 ou supérieure)
- **Git**

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repository>
cd enhanced-classroom
```

### 2. Configuration de la base de données

#### A. Installer et démarrer MySQL

```bash
# Sur Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Sur macOS avec Homebrew
brew install mysql
brew services start mysql

# Sur Windows
# Télécharger et installer MySQL depuis https://dev.mysql.com/downloads/mysql/
```

#### B. Créer la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE enhanced_classroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Créer un utilisateur (optionnel mais recommandé)
CREATE USER 'classroom_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON enhanced_classroom.* TO 'classroom_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### C. Importer le schéma de base de données

```bash
mysql -u root -p enhanced_classroom < database/schema.sql
```

### 3. Configuration du Backend

#### A. Installer les dépendances

```bash
cd backend
npm install
```

#### B. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

Configurez les variables suivantes dans `.env` :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=enhanced_classroom
DB_USER=root
DB_PASSWORD=your_mysql_password

# Configuration JWT
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Configuration des fichiers
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configuration CORS
FRONTEND_URL=http://localhost:3000
```

#### C. Démarrer le serveur backend

```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start
```

Le serveur backend sera accessible sur `http://localhost:5000`

### 4. Configuration du Frontend

#### A. Installer les dépendances

```bash
cd frontend
npm install
```

#### B. Configuration des variables d'environnement (optionnel)

```bash
# Créer un fichier .env dans le dossier frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

#### C. Démarrer l'application React

```bash
npm start
```

L'application frontend sera accessible sur `http://localhost:3000`

## Vérification de l'installation

### 1. Test de l'API Backend

```bash
# Test de santé de l'API
curl http://localhost:5000/api/health
```

Vous devriez recevoir une réponse JSON indiquant que l'API fonctionne.

### 2. Test de l'application complète

1. Ouvrez votre navigateur et allez sur `http://localhost:3000`
2. Vous devriez voir la page de connexion
3. Cliquez sur "S'inscrire" pour créer un compte
4. Testez la création d'un professeur et d'un étudiant

## Fonctionnalités Principales

### Pour les Professeurs

- ✅ Créer et gérer des classes avec codes uniques
- ✅ Ajouter des étudiants par email
- ✅ Créer des groupes et désigner des coordinateurs
- ✅ Suivre la progression des projets par étapes
- ✅ Corriger les travaux avec fichiers joints
- ✅ Système de messagerie avancé

### Pour les Étudiants

- ✅ Rejoindre des classes par code
- ✅ Travailler en groupe avec coordination
- ✅ Soumettre des travaux (coordinateur) et commenter (membres)
- ✅ Voir les corrections du professeur
- ✅ Suivre la progression du projet
- ✅ Messagerie collaborative

## Étapes de Progression Prédéfinies

L'application inclut 12 étapes de progression pour les projets tutorés :

1. Soumission du thème
2. Validation du thème
3. Rédaction du chapitre 1
4. Chapitre 1 validé
5. Rédaction du chapitre 2
6. Chapitre 2 validé
7. Rédaction du chapitre 3
8. Chapitre 3 validé
9. Version provisoire
10. Diapo de présentation
11. Correction après soutenance
12. Version finale

## Dépannage

### Problèmes courants

#### Erreur de connexion à la base de données

```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les permissions utilisateur
mysql -u root -p
SHOW GRANTS FOR 'classroom_user'@'localhost';
```

#### Erreur CORS

- Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL de votre frontend
- Assurez-vous que le backend est démarré avant le frontend

#### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 5000
lsof -i :5000

# Tuer le processus si nécessaire
kill -9 <PID>
```

#### Problèmes de permissions de fichiers

```bash
# Donner les permissions appropriées au dossier uploads
chmod 755 backend/uploads
```

## Déploiement en Production

### 1. Variables d'environnement de production

```env
NODE_ENV=production
JWT_SECRET=un_secret_tres_long_et_securise_pour_la_production
DB_PASSWORD=un_mot_de_passe_tres_securise
```

### 2. Construction du frontend

```bash
cd frontend
npm run build
```

### 3. Serveur de production

Vous pouvez utiliser PM2 pour gérer le processus backend :

```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name enhanced-classroom
```

## Support et Contribution

Pour toute question ou problème :

1. Vérifiez la documentation
2. Consultez les logs d'erreur
3. Contactez l'équipe de développement

## Sécurité

- Changez le `JWT_SECRET` en production
- Utilisez des mots de passe forts pour la base de données
- Activez HTTPS en production
- Limitez les permissions de la base de données
- Gardez les dépendances à jour

## Architecture Technique

### Backend (Node.js/Express)
- **Authentication**: JWT avec bcrypt pour le hashage des mots de passe
- **Base de données**: MySQL avec pool de connexions
- **Validation**: express-validator pour la validation des données
- **Sécurité**: helmet, CORS, rate limiting
- **Upload de fichiers**: multer pour la gestion des fichiers

### Frontend (React)
- **UI Framework**: Material-UI pour une interface moderne
- **Routing**: React Router pour la navigation
- **State Management**: Context API pour l'authentification
- **Forms**: react-hook-form pour la gestion des formulaires
- **HTTP Client**: axios avec intercepteurs pour l'API

### Base de Données (MySQL)
- **Schéma normalisé** avec contraintes d'intégrité référentielle
- **Index optimisés** pour les performances
- **Support Unicode** (utf8mb4) pour les caractères internationaux