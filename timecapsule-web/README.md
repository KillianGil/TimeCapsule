# TimeCapsule - Application Web (Next.js)

## 🌐 Description
Version web de l'application TimeCapsule, permettant d'accéder aux capsules temporelles depuis un navigateur.

## 🛠 Technologies
- **Next.js 15** (App Router)
- **TypeScript**
- **Supabase** (Backend, Auth, Storage)
- **Lucide React** (Icônes)
- **Lottie React** (Animations)

## 📋 Prérequis
- Node.js 18+
- npm ou yarn

## 🚀 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   Créer un fichier `.env.local` à la racine avec :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet
```
web-app/
├── src/
│   ├── app/                    # Pages (Next.js App Router)
│   │   ├── auth/              # Pages d'authentification
│   │   ├── dashboard/         # Pages du tableau de bord
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Composants réutilisables
│   └── lib/                   # Utilitaires
│       ├── supabase.ts       # Client Supabase
│       └── types.ts          # Types TypeScript
├── public/                    # Assets statiques
└── package.json              # Dépendances
```

## ✨ Fonctionnalités
- 🔐 Authentification (inscription, connexion, mot de passe oublié)
- 📹 Envoi de vidéos
- 🎵 Recherche et ajout de musique via iTunes
- ⏰ Compte à rebours pour les capsules verrouillées
- 👥 Gestion des amis
- 👤 Profil utilisateur avec photo

## 🎨 Design
- Interface moderne avec thème sombre
- Animation de fond avec particules
- Navbar flottante et responsive
- Design inspiré de l'application mobile

## 👤 Auteur
Killian Gil - Université Paris-Saclay
