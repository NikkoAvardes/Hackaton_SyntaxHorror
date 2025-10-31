import React, { useEffect } from 'react';

const HorrorContent = () => {
  useEffect(() => {
    // Son d'horreur - utilisons un son plus effrayant
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDOL0fPTgjEGH3fE7+OZSA0PVEL+');
    audio.loop = true;
    audio.volume = 0.3;
    
    // Tentative de jouer le son (peut être bloqué par le navigateur)
    audio.play().catch(() => {
      console.log('Audio playback prevented by browser');
    });

    // Effet de clignotement
    const interval = setInterval(() => {
      document.body.style.backgroundColor = document.body.style.backgroundColor === 'red' ? 'black' : 'red';
    }, 500);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(interval);
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="horror">
      <h1>⚠️ VOUS ÊTES MAINTENANT DANS L'HORREUR ⚠️</h1>
      <p className="scary-text">Regarde derrière toi... 👻</p>
      <img src="https://cdn.fishki.net/upload/post/2018/08/29/2688508/1-19.gif" alt="scary" />
      
      <div className="horror-content">
        <h2>💀 IL EST TROP TARD POUR REVENIR EN ARRIÈRE 💀</h2>
        <p>🩸 Le sang coule... 🩸</p>
        <p>👹 Les démons se réveillent... 👹</p>
        <p>🕷️ Les araignées rampent... 🕷️</p>
        <p>⚰️ La mort vous appelle... ⚰️</p>
        
        <div className="glitch-effect">
          <h3>ERREUR... ERREUR... ERREUR...</h3>
        </div>
      </div>
    </div>
  );
};

export default HorrorContent;
