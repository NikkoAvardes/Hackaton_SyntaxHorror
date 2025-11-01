# Syntax Horror - Interactive Horror Experience

Une expérience d'horreur interactive construite avec React et Three.js, où les utilisateurs explorent un environnement 3D et rencontrent des screamers dans des zones prédéfinies.

## 📁 Как добавить свой 3D модель (.glb файл)

### 🎯 Куда поместить GLB файл:

1. **Поместите ваш .glb файл в папку `public/`**
   ```
   Hackaton_SyntaxHorror/
   ├── public/
   │   ├── 10_31_2025.glb    ← Текущий файл
   │   └── your-model.glb    ← Ваш новый файл
   └── src/
   ```

2. **Измените путь в коде:**
   - Откройте файл `src/App.jsx`
   - Найдите строку: `<GLBModel path="/10_31_2025.glb" />`
   - Замените на: `<GLBModel path="/your-model.glb" />`

### 🔧 Требования к GLB файлу:
- **Формат**: .glb (предпочтительно) или .gltf
- **Размер**: Рекомендуется до 50MB для веба
- **Координаты**: Центр модели должен быть в (0,0,0)
- **Масштаб**: Модель будет загружена с масштабом 1:1

### � Текущие улучшения:
- ✅ **Улучшено освещение** - теперь лучше видно
- ✅ **Цветная подсветка** триггерных зон
- ✅ **Автоматическая загрузка GLB** модели
- ✅ **Fallback комната** если модель не загружается

### 🚀 Быстрая замена модели:
```bash
# 1. Скопируйте ваш файл в public/
cp /путь/к/вашей/модели.glb public/

# 2. Обновите код (или используйте редактор)
sed -i 's|/10_31_2025.glb|/модели.glb|g' src/App.jsx

# 3. Перезапустите сервер
npm run dev
```

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

- **W, A, S, D** : Déplacement
- **Souris** : Regarder autour
- **Clic** : Verrouiller le curseur pour une meilleure immersion

## 📁 Structure du Projet

```
src/
├── App.jsx              # Gestion de l'état global et routage
├── App.css              # Styles principaux
├── main.jsx             # Point d'entrée React
└── components/
    ├── StartScreen.jsx   # Écran d'accueil
    ├── Scene.jsx         # Configuration 3D et caméra
    ├── TriggerZone.jsx   # Composant des zones de trigger
    └── HorrorEffect.jsx  # Effets visuels des screamers
```

## 🎨 Style et Atmosphère

- **Palette de couleurs** : Noir, rouge sombre, blanc pour les contrastes
- **Éclairage** : Ambiance faible, lumière directionnelle minimale, point light rouge
- **Effets visuels** : 
  - Brouillard pour limiter la visibilité
  - Animations de glitch lors des screamers
  - Effets de scanlines TV
  - Tremblements et distorsions
- **Audio** : Sons d'ambiance générés avec Web Audio API

## 🔧 Technologies Utilisées

- **React 18** - Interface utilisateur
- **Three.js** - Moteur 3D
- **React Three Fiber** - Intégration React/Three.js
- **React Three Drei** - Helpers et composants 3D
- **Vite** - Bundler et serveur de développement
- **Web Audio API** - Génération de sons procéduraux

## 📝 Modèle 3D

Le projet est configuré pour utiliser le fichier `10_31_2025.glb` qui doit être placé dans le dossier `public/`. 

Pour remplacer le modèle :
1. Placez votre fichier `.glb` dans le dossier `public/`
2. Modifiez le chemin dans `Scene.jsx` ligne : `const { scene } = useGLTF('/votre-fichier.glb');`

## 🎧 Recommandations

- **Utilisez des écouteurs** pour une expérience immersive optimale
- **Jouez dans l'obscurité** pour une meilleure atmosphère
- **Navigateur moderne** requis (Chrome, Firefox, Safari récents)
- **Casque VR** (optionnel) - Compatible WebXR pour une expérience encore plus immersive

## 🐛 Debug

Pour voir les zones de trigger (debug) :
1. Ouvrez `src/components/TriggerZone.jsx`
2. Changez `const debug = false;` en `const debug = true;`
3. Les zones apparaîtront comme des sphères rouges semi-transparentes

## 🔄 Développement Futur

- Ajout de plus de types de screamers
- Système de son spatialisé
- Support pour plus de formats de modèles 3D
- Système de sauvegarde de progression
- Mode multijoueur
- Intégration WebXR pour la VR

## ⚠️ Avertissements

- **Contenu pour adultes** : Effets visuels et sonores intenses
- **Épilepsie** : Présence de flashs lumineux rapides
- **Volume sonore** : Contrôlez le volume de votre système

---

*Développé pour l'événement Hackathon avec ❤️ et 👻*