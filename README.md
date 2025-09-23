# 🏪 BOOTCAMP E-Commerce Platform

Une plateforme e-commerce complète avec dashboard analytics, gestion des produits, commandes, et service de réparation. Développée avec Next.js, React, TypeScript et Supabase.

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture Technique](#architecture-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Structure du Projet](#structure-du-projet)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables d'Environnement](#variables-denvironnement)
- [Déploiement](#déploiement)
- [Contribuer](#contribuer)
- [Licence](#licence)

## 🎯 Aperçu

BOOTCAMP est une plateforme e-commerce moderne qui offre :

- **Frontend React/Next.js** : Interface utilisateur responsive et moderne
- **Backend Supabase** : Base de données PostgreSQL avec authentification intégrée
- **Dashboard Analytics** : Métriques en temps réel des ventes, stocks, et réparations
- **Gestion des Produits** : Catalogue avec variantes (tailles, couleurs)
- **Système de Commandes** : Traitement complet du panier à la livraison
- **Service de Réparation** : Gestion des demandes de réparation client
- **Alertes de Stock** : Surveillance automatique des niveaux d'inventaire

## ✨ Fonctionnalités

### 🛒 E-Commerce
- ✅ Catalogue de produits avec variantes (tailles, couleurs)
- ✅ Panier d'achat avec calcul automatique
- ✅ Intégration Stripe pour les paiements
- ✅ Gestion des commandes et suivi
- ✅ Historique des achats client

### 📊 Dashboard Analytics
- ✅ Métriques de ventes en temps réel
- ✅ Chiffre d'affaires et panier moyen
- ✅ Graphiques des revenus (journalier, hebdomadaire)
- ✅ Alertes de stock automatiques
- ✅ Statistiques des demandes de réparation

### 🔧 Service de Réparation
- ✅ Soumission de demandes de réparation
- ✅ Suivi du statut (en attente, en cours, terminé)
- ✅ Historique des réparations
- ✅ Interface de gestion pour les administrateurs

### 👤 Gestion Utilisateur
- ✅ Authentification Supabase
- ✅ Rôles utilisateurs (client, vendeur, admin)
- ✅ Profils et préférences
- ✅ Historique des commandes

### 🎨 Interface Utilisateur
- ✅ Design responsive (mobile-first)
- ✅ Thème moderne avec Tailwind CSS
- ✅ Animations et transitions fluides
- ✅ Accessibilité WCAG 2.1
- ✅ Interface multilingue (Français)

## 🏗️ Architecture Technique

```
├── Frontend (Next.js 15)
│   ├── Pages (App Router)
│   ├── Components (React + TypeScript)
│   ├── Styling (Tailwind CSS)
│   └── State Management (React Hooks)
├── Backend (Supabase)
│   ├── Database (PostgreSQL)
│   ├── Authentication
│   ├── Storage (Images/Files)
│   └── Real-time Subscriptions
└── External Services
    ├── Stripe (Paiements)
    └── Email Service
```

### Stack Technologique

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS, React Icons
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Paiements** : Stripe
- **Déploiement** : Vercel/Netlify
- **Versioning** : Git

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Git
- Compte Supabase
- Compte Stripe (pour les paiements)

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone https://github.com/your-username/bootcamp.git
cd bootcamp
```

2. **Installer les dépendances**
```bash
# Frontend
cd front
npm install

# Backend (Supabase)
cd ../supabase
npm install
```

3. **Configuration de l'environnement**
```bash
# Copier les fichiers d'environnement
cp .env.example .env.local
cp .env.example .env.production
```

5. **Lancer l'application**
```bash
# Frontend
npx next dev

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env.local` dans le dossier `front/` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Configuration Supabase

1. **Créer un projet Supabase**
2. **Configurer l'authentification**
   - Activer les providers souhaités (Email, Google, etc.)
   - Configurer les URLs de redirection

3. **Créer les tables**
```sql
-- Tables principales
CREATE TABLE products (...)
CREATE TABLE product_variants (...)
CREATE TABLE orders (...)
CREATE TABLE order_items (...)
CREATE TABLE repairs (...)
CREATE TABLE users (...)
```

4. **Configurer le Storage**
   - Bucket pour les images de produits
   - Politiques RLS (Row Level Security)

## 🎮 Utilisation

### Pour les Clients

1. **Navigation** : Parcourir le catalogue de produits
2. **Sélection** : Choisir tailles et couleurs
3. **Panier** : Ajouter des articles et gérer les quantités
4. **Paiement** : Procéder au checkout avec Stripe
5. **Suivi** : Consulter l'historique des commandes

### Pour les Administrateurs

1. **Dashboard** : Consulter les métriques en temps réel
2. **Gestion Produits** : Ajouter/modifier/supprimer des produits
3. **Commandes** : Traiter et expédier les commandes
4. **Réparations** : Gérer les demandes de service
5. **Stock** : Surveiller les niveaux d'inventaire

### Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| **Client** | Achats, historique des commandes, demandes de réparation |
| **Vendeur** | Gestion des commandes, support client |
| **Admin** | Accès complet à toutes les fonctionnalités |

## 🔌 API Endpoints

### Dashboard API

```typescript
// Métriques de ventes
GET /api/dashboard/sales-stats
// Chiffre d'affaires, nombre de ventes, panier moyen

GET /api/dashboard/revenue-data
// Données de revenus pour graphiques

GET /api/dashboard/stock-alerts
// Alertes de stock (produits à réassortir)

GET /api/dashboard/repair-stats
// Statistiques des réparations
```

### Products API

```typescript
GET /api/products
// Liste des produits avec variantes

POST /api/products
// Créer un nouveau produit

PUT /api/products/:id
// Mettre à jour un produit

DELETE /api/products/:id
// Supprimer un produit
```

### Orders API

```typescript
GET /api/orders
// Historique des commandes

POST /api/orders
// Créer une nouvelle commande

GET /api/orders/:id
// Détails d'une commande

PUT /api/orders/:id/status
// Mettre à jour le statut d'une commande
```

## 📁 Structure du Projet

```
BOOTCAMP/
├── front/                          # Frontend Next.js
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # Composants React
│   │   ├── lib/                    # Utilitaires et API
│   │   ├── types/                  # Types TypeScript
│   │   └── styles/                 # Styles globaux
│   ├── public/                     # Assets statiques
│   └── package.json
├── supabase/                       # Backend Supabase
│   ├── migrations/                 # Migrations de base de données
│   ├── seed/                       # Données de test
│   └── config.toml                 # Configuration Supabase
├── docs/                           # Documentation
└── README.md                       # Ce fichier
```

### Composants Principaux

- **ProductCard** : Affichage des produits dans le catalogue
- **Cart** : Gestion du panier d'achat
- **Dashboard** : Métriques et analytics
- **SalesMetric** : Métriques de ventes
- **RepairChart** : Graphique des réparations
- **StockAlerts** : Alertes de stock
- **RevenueChart** : Graphique des revenus

## 📜 Scripts Disponibles

### Frontend Scripts

```bash
# Développement
npm run dev              # Démarrer le serveur de développement
npm run build           # Construire pour la production
npm run start           # Démarrer en mode production
npm run lint            # Vérifier le code avec ESLint
npm run type-check      # Vérifier les types TypeScript

# Tests
npm run test            # Exécuter les tests
npm run test:watch      # Tests en mode watch
npm run test:coverage   # Tests avec couverture
```

### Supabase Scripts

```bash
# Développement local
npx supabase start      # Démarrer Supabase localement
npx supabase stop       # Arrêter Supabase
npx supabase status     # Statut des services

# Base de données
npx supabase db reset   # Réinitialiser la base de données
npx supabase db push    # Appliquer les migrations
npx supabase db diff    # Voir les différences

# Auth
npx supabase auth api   # API d'authentification
```

## 🔐 Variables d'Environnement

### Frontend (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

### Supabase (config.toml)

```toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage", "auth"]
extra_search_path = ["extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[auth]
enabled = true
port = 54325
site_url = "http://localhost:3000"
```

## 🚀 Déploiement

### Frontend (Vercel)

1. **Connecter à Vercel**
```bash
npm i -g vercel
vercel
```

2. **Configuration automatique**
   - Vercel détecte automatiquement Next.js
   - Variables d'environnement configurées automatiquement

3. **Déploiement**
```bash
vercel --prod
```

### Backend (Supabase)

1. **Déploiement automatique**
   - Push vers la branche main déclenche le déploiement
   - Migrations appliquées automatiquement

2. **Configuration production**
```bash
# Variables d'environnement de production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
```

### Optimisations de Production

- **Images** : Optimisation automatique avec Next.js Image
- **Bundle** : Code splitting et lazy loading
- **Cache** : Stratégies de cache optimisées
- **CDN** : Distribution globale des assets

## 🤝 Contribuer

### Guide de Contribution

1. **Fork le repository**
2. **Créer une branche feature**
```bash
git checkout -b feature/AmazingFeature
```

3. **Commit des changements**
```bash
git commit -m 'Add some AmazingFeature'
```

4. **Push vers la branche**
```bash
git push origin feature/AmazingFeature
```

5. **Créer une Pull Request**

### Standards de Code

- **TypeScript** : Typage strict activé
- **ESLint** : Configuration Next.js
- **Prettier** : Formatage automatique
- **Commits** : Messages conventionnels

### Tests

- **Unit Tests** : Jest + React Testing Library
- **Integration Tests** : Tests des API endpoints
- **E2E Tests** : Cypress (optionnel)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : `/docs`
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions
- **Email** : support@bootcamp.com

## 🎉 Remerciements

- **Supabase** : Backend-as-a-Service exceptionnel
- **Next.js** : Framework React moderne
- **Tailwind CSS** : Framework CSS utilitaire
- **Stripe** : Solution de paiement fiable
- **Vercel** : Plateforme de déploiement

---

**BOOTCAMP E-Commerce Platform** - Une solution complète pour votre business en ligne ! 🏪✨
