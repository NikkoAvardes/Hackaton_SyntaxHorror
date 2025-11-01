import React from 'react';

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>SYNTAX HORROR</h1>
      <p>
        Bienvenue dans une expérience d'horreur interactive. 
        Explorez l'environnement 3D, mais attention... 
        des surprises vous attendent dans l'obscurité.
      </p>
      <p>
        <strong>Contrôles :</strong><br />
        WASD - Déplacement<br />
        Souris - Regarder autour<br />
        Écouteurs recommandés
      </p>
      <button className="start-button" onClick={onStart}>
        Commencer l'exploration
      </button>
    </div>
  );
};

export default StartScreen;