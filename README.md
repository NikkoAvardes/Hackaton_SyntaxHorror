# Syntax Horror - Expérience d'Horreur Interactive

Une expérience d'horreur interactive construite avec React et Three.js, où les utilisateurs explorent un environnement 3D immersif avec des screamers et des puzzles de codes.

## 🎮 Description du Jeu

Syntax Horror est un jeu d'horreur en première personne qui vous fait explorer 4 chambres interconnectées :

- **Chambre 1** : Point de départ - Trouvez le code pour continuer
- **Chambre 2** : Couloirs complexes avec choix de routes  
- **Chambre WC** : Zone avec screamer - Attention !
- **Chambre 3** : Destination finale

### 🔐 Système de Codes
- **Chambre 1 → Chambre 2** : Code `0000`
- **Chambre 2 → Chambre WC** : Code `2468`
- **Passage direct Chambre 2 → Chambre 3** : Pas de code requis

### 👻 Effets d'Horreur
- **Screamer dans Chambre WC** : GIF + Son synchronisé aux coordonnées X:-1.75, Z:-2.20
- **Musique d'ambiance** : Boucle continue d'horreur
- **Atmosphère sombre** : Éclairage minimal et effets visuels

## 📁 Comment ajouter votre modèle 3D (.glb)

### 🎯 Emplacement des fichiers GLB :

1. **Placez vos fichiers .glb dans le dossier `public/`**
   ```
   Hackaton_SyntaxHorror/
   ├── public/
   │   ├── chambre1.glb     ← Modèle Chambre 1
   │   ├── chambre2.glb     ← Modèle Chambre 2  
   │   ├── chambreWC.glb    ← Modèle Chambre WC
   │   ├── chambre3.glb     ← Modèle Chambre 3
   │   ├── music/           ← Dossier audio
   │   └── screamers/       ← Dossier GIF screamers
   └── src/
   ```

2. **Noms de fichiers requis :**
   - `chambre1.glb` : Chambre de départ
   - `chambre2.glb` : Chambre principale avec couloirs
   - `chambreWC.glb` : Chambre avec screamer
   - `chambre3.glb` : Chambre finale

### 🔧 Exigences pour les fichiers GLB :
- **Format** : .glb (recommandé) ou .gltf
- **Taille** : Recommandé ≤ 50MB pour les performances web
- **Coordonnées** : Centre du modèle à (0,0,0)
- **Échelle** : Les modèles sont chargés à l'échelle 1:1

### ✨ Fonctionnalités actuelles :
- ✅ **4 chambres distinctes** avec navigation fluide
- ✅ **Système de codes** pour progression
- ✅ **Éclairage dynamique** adapté à chaque chambre
- ✅ **Screamer avec GIF et son** synchronisés
- ✅ **Musique d'ambiance** continue
- ✅ **Contrôles FPS** optimisés
- ✅ **Interface française** minimaliste

## 🚀 Installation et Lancement

### Prérequis
- Node.js (version 16+)
- npm ou yarn

### Instructions
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir votre navigateur à l'adresse affichée (généralement http://localhost:5173)
```

### Build de production
```bash
npm run build
npm run preview
```

## 🎮 Contrôles

- **W, A, S, D** : Déplacement (vitesse réduite pour l'immersion)
- **Souris** : Regarder autour
- **Clic** : Capturer la souris pour l'immersion
- **F** : Ouvrir les portes avec codes
- **ESC** : Libérer la souris / Fermer interfaces

## 📁 Structure du Projet

```
src/
├── App.jsx              # Logique principale du jeu
├── App.css              # Styles et animations
└── main.jsx             # Point d'entrée React

public/
├── chambre1.glb         # Modèle 3D Chambre 1
├── chambre2.glb         # Modèle 3D Chambre 2
├── chambreWC.glb        # Modèle 3D Chambre WC
├── chambre3.glb         # Modèle 3D Chambre 3
├── music/
│   ├── scrimer.mp3      # Musique de fond (40% volume)
│   └── gif.mp3          # Son screamer (100% volume)
└── screamers/
    └── 4eiD.gif         # GIF du screamer
```

## 🎨 Style et Atmosphère

- **Interface** : Minimaliste en français
- **Éclairage** : Ambiance sombre avec éclairage spécialisé par chambre
- **Musique** : Boucle d'horreur continue à 40% de volume
- **Effets sonores** : Screamer à volume maximum pour l'impact
- **Vitesse** : Déplacement ralenti pour l'immersion

## 🔧 Technologies Utilisées

- **React 18** - Interface utilisateur
- **Three.js** - Moteur 3D
- **React Three Fiber** - Intégration React/Three.js
- **React Three Drei** - Helpers et composants 3D
- **Vite** - Bundler et serveur de développement
- **Web Audio API** - Gestion audio avancée

## 🎧 Configuration Audio

### Musique de fond (scrimer.mp3)
- Volume : 40%
- Format : MP3
- Boucle : Continue dans toutes les chambres
- Démarrage : Automatique au lancement

### Son screamer (gif.mp3)  
- Volume : 100% (impact maximum)
- Déclenchement : 1 seconde après apparition du GIF
- Localisation : Chambre WC uniquement
- Coordonnées : X:-1.75, Z:-2.20

## 📍 Positions et Coordonnées

### Spawns par chambre :
- **Chambre 1** : X:-1, Y:0.1, Z:-3.5
- **Chambre 2** : X:2.40, Y:0.1, Z:3.60  
- **Chambre WC** : X:2, Y:0.1, Z:-0.50
- **Chambre 3** : X:0.2, Y:0.1, Z:-3.4

### Trigger screamer :
- **Position** : X:-1.75, Y:0, Z:-2.20 (Chambre WC)
- **Rayon** : 1.5 unités
- **Durée** : 2.5 secondes

## 🔐 Codes d'Accès

- **Chambre 1 → Chambre 2** : `0000`
- **Chambre 2 → Chambre WC** : `2468`
- **Passage direct Chambre 2 → Chambre 3** : Aucun code

## 🎯 Recommandations

- **Casque audio** recommandé pour l'immersion totale
- **Environnement sombre** pour une meilleure atmosphère
- **Navigateur moderne** requis (Chrome, Firefox, Safari récents)
- **Volume système** contrôlé (le screamer est à 100%)

## ⚠️ Avertissements

- **Contenu d'horreur** : Effets visuels et sonores intenses
- **Épilepsie** : Présence possible de flashs lumineux
- **Volume sonore** : Le screamer est très fort (100% volume)
- **Âge recommandé** : 16+ en raison du contenu d'horreur

---

*Développé pour le Hackathon avec ❤️ et 👻*

**Créé par Nicolai, étudiant à Holberton School**
