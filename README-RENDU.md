# TimeCapsule - Projet Complet

## 📦 Organisation du projet

Ce dossier contient deux applications distinctes :

```
TimeCapsule-Rendu/
├── mobile-app/     📱 Application Mobile (Expo React Native)
└── web-app/        🌐 Application Web (Next.js)
```

---

## 📱 Application Mobile (`mobile-app/`)

Application React Native avec Expo pour iOS et Android.

### Lancer l'application :
```bash
cd mobile-app
npm install
npx expo start
```

Puis scanner le QR code avec l'application Expo Go.

### Technologies principales :
- React Native + Expo
- TypeScript
- Supabase
- Expo Router
- Lottie Animations

---

## 🌐 Application Web (`web-app/`)

Application Next.js pour navigateurs.

### Lancer l'application :
```bash
cd web-app
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000)

### Technologies principales :
- Next.js 15 (App Router)
- TypeScript
- Supabase
- Lucide React Icons

---

## 🔧 Configuration

Les deux applications nécessitent les mêmes credentials Supabase :

### Pour mobile (`mobile-app/.env`) :
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Pour web (`web-app/.env.local`) :
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## ✨ Fonctionnalités communes

- 🔐 Authentification sécurisée
- 📹 Envoi de capsules vidéo
- 🎵 Musique d'ambiance
- ⏰ Ouverture programmée avec compte à rebours
- 👥 Gestion des amis
- 👤 Profil utilisateur

---

## 👤 Auteur

**Killian Gil**  
Université Paris-Saclay

---

## 📝 Notes

- Les dossiers `node_modules` ne sont pas inclus (exécuter `npm install` avant utilisation)
- Les fichiers `.env` doivent être configurés avec vos propres credentials Supabase
