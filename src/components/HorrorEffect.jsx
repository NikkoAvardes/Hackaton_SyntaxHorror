import React, { useEffect, useState } from 'react';

const HorrorEffect = ({ data }) => {
  const [glitchIntensity, setGlitchIntensity] = useState(1);

  useEffect(() => {
    // Animation de l'intensité du glitch
    const interval = setInterval(() => {
      setGlitchIntensity(Math.random());
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const screamerImages = [
    "💀 VOUS AVEZ ÉTÉ TROUVÉ 💀",
    "🩸 IL VOUS OBSERVE 🩸", 
    "👁️ VOUS N'ÊTES PAS SEUL 👁️",
    "⚠️ DANGER ⚠️",
    "🔥 FUYEZ 🔥"
  ];

  const randomImage = screamerImages[Math.floor(Math.random() * screamerImages.length)];

  return (
    <div className="horror-effect">
      <div 
        className="screamer-overlay"
        style={{
          filter: `hue-rotate(${glitchIntensity * 360}deg) brightness(${0.5 + glitchIntensity * 0.5})`,
          animation: `glitch ${0.05 + Math.random() * 0.1}s infinite`
        }}
      >
        <div 
          className="screamer-image"
          style={{
            transform: `scale(${0.8 + glitchIntensity * 0.4}) rotate(${(glitchIntensity - 0.5) * 10}deg)`,
            background: `radial-gradient(circle, 
              hsl(${Math.random() * 60}, 100%, 50%) 0%, 
              #000 ${50 + glitchIntensity * 30}%)`
          }}
        >
          {randomImage}
        </div>
      </div>
      
      {/* Effet de flash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#fff',
          opacity: glitchIntensity * 0.3,
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Lignes de scan TV */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          )`,
          pointerEvents: 'none',
          animation: 'scanlines 0.1s linear infinite'
        }}
      />
      
      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
};

export default HorrorEffect;