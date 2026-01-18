# TimeCapsule - Application Mobile (Expo React Native)

## 📱 Description
Application mobile de capsules temporelles permettant d'envoyer des messages vidéo à des amis, programmés pour s'ouvrir à une date future.

## 🛠 Technologies
- **React Native** avec **Expo**
- **TypeScript**
- **Supabase** (Backend, Auth, Storage)
- **Expo Router** (Navigation)
- **Lottie** (Animations)

## 📋 Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Application Expo Go sur votre téléphone (ou émulateur iOS/Android)

## 🚀 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   Créer un fichier `.env` à la racine avec :
   ```
   EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   ```

3. **Lancer l'application**
   ```bash
   npx expo start
   ```

4. **Scanner le QR code** avec l'app Expo Go sur votre téléphone

## 📁 Structure du projet
```
mobile-app/
├── app/                    # Pages (Expo Router)
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Pages du tableau de bord
│   └── _layout.tsx        # Layout principal
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et services
│   ├── supabase/         # Client Supabase
│   ├── services/         # Services (notifications, musique)
│   └── types.ts          # Types TypeScript
├── assets/               # Images, animations Lottie
└── app.json              # Configuration Expo
```

## ✨ Fonctionnalités
- 🔐 Authentification (inscription, connexion, mot de passe oublié)
- 📹 Enregistrement et envoi de vidéos
- 🎵 Ajout de musique aux capsules
- ⏰ Programmation de l'ouverture
- 👥 Gestion des amis
- 🔔 Notifications push
- 📍 Mode Réalité Augmentée (AR)

## 👤 Auteur
Killian Gil - Université Paris-Saclay
