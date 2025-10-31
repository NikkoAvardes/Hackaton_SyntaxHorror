import React, { useState, useEffect } from 'react';
import CuteContent from './components/CuteContent';
import HorrorContent from './components/HorrorContents';
import './styles.css';

function App() {
  const [isHorror, setIsHorror] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Plus sensible : si l'utilisateur fait défiler plus de 50px
      if (window.scrollY > 50) {
        setIsHorror(true);
      } else {
        setIsHorror(false);
      }
    };

    // Ajouter également un déclencheur au survol pour tester
    const handleMouseMove = (e) => {
      if (e.clientY > window.innerHeight / 2) {
        // Si la souris est dans la moitié inférieure de l'écran
        setIsHorror(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="App">
      {isHorror ? <HorrorContent /> : <CuteContent />}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        Mode: {isHorror ? '👹 HORREUR' : '🐱 MIGNON'} | Scroll: {Math.round(window.scrollY)}px
      </div>
    </div>
  );
}

export default App;
