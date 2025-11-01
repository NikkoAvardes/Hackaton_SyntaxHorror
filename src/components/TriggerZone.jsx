import React from 'react';

// Composant pour les zones de trigger (invisibles, seulement pour le debug)
const TriggerZone = ({ position, radius }) => {
  // En mode debug, on peut rendre visible ces zones
  const debug = false;

  if (!debug) return null;

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial 
        color="#ff0000" 
        transparent 
        opacity={0.3} 
        wireframe 
      />
    </mesh>
  );
};

export default TriggerZone;