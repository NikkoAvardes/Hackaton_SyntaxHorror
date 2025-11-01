import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useGLTF, Fog } from '@react-three/drei';
import * as THREE from 'three';
import TriggerZone from './TriggerZone';

// Composant pour le mouvement de la caméra
function FirstPersonControls({ onTriggerHorror }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(true);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(true);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(true);
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(false);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(false);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(moveForward) - Number(moveBackward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.normalize();

    if (moveForward || moveBackward) velocity.current.z -= direction.current.z * 40.0 * delta;
    if (moveLeft || moveRight) velocity.current.x -= direction.current.x * 40.0 * delta;

    controlsRef.current.moveRight(-velocity.current.x * delta);
    controlsRef.current.moveForward(-velocity.current.z * delta);

    // Vérifier la position pour les triggers
    const position = camera.position;
    checkTriggers(position, onTriggerHorror);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
}

// État global pour les triggers (pour éviter les répétitions)
const triggeredZones = new Set();

// Fonction pour vérifier les zones de trigger
const checkTriggers = (position, onTriggerHorror) => {
  const triggerZones = [
    { position: [5, 0, 5], radius: 2, id: 'trigger1' },
    { position: [-5, 0, -5], radius: 2, id: 'trigger2' },
    { position: [0, 0, -10], radius: 2, id: 'trigger3' }
  ];

  triggerZones.forEach((zone) => {
    if (!triggeredZones.has(zone.id)) {
      const distance = position.distanceTo(new THREE.Vector3(...zone.position));
      if (distance < zone.radius) {
        triggeredZones.add(zone.id);
        onTriggerHorror({
          type: 'screamer',
          id: zone.id,
          intensity: Math.random() * 0.5 + 0.5
        });
      }
    }
  });
};

// Composant pour charger le modèle 3D
function RoomModel() {
  const { scene } = useGLTF('/10_31_2025.glb');
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Assombrir les matériaux pour l'atmosphère d'horreur
          if (child.material) {
            child.material.color.multiplyScalar(0.3);
          }
        }
      });
    }
  }, [scene]);

  return scene ? <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} /> : null;
}

// Composant principal de la scène
const HorrorScene = ({ onTriggerHorror }) => {
  return (
    <>
      <div className="game-instructions">
        <h3>Contrôles</h3>
        <ul>
          <li>W, A, S, D - Se déplacer</li>
          <li>Souris - Regarder</li>
          <li>Clic - Verrouiller la souris</li>
        </ul>
      </div>
      
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Éclairage d'ambiance très faible */}
        <ambientLight intensity={0.1} color="#440000" />
        
        {/* Lumière directionnelle faible */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Lumière ponctuelle rouge pour l'atmosphère */}
        <pointLight
          position={[0, 3, 0]}
          intensity={0.3}
          color="#ff0000"
          distance={10}
          decay={2}
        />

        {/* Brouillard pour l'atmosphère */}
        <Fog attach="fog" args={['#000000', 1, 30]} />

        {/* Contrôles de première personne */}
        <FirstPersonControls onTriggerHorror={onTriggerHorror} />

        {/* Modèle de la pièce */}
        <RoomModel />

        {/* Zones de trigger invisibles */}
        <TriggerZone position={[5, 0, 5]} radius={2} />
        <TriggerZone position={[-5, 0, -5]} radius={2} />
        <TriggerZone position={[0, 0, -10]} radius={2} />

        {/* Sol de base au cas où le modèle n'en aurait pas */}
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial color="#111111" />
        </mesh>

        {/* Murs de base pour délimiter l'espace */}
        <mesh position={[0, 5, -25]} receiveShadow>
          <boxGeometry args={[50, 10, 1]} />
          <meshLambertMaterial color="#222222" />
        </mesh>
        
        <mesh position={[0, 5, 25]} receiveShadow>
          <boxGeometry args={[50, 10, 1]} />
          <meshLambertMaterial color="#222222" />
        </mesh>
        
        <mesh position={[-25, 5, 0]} receiveShadow>
          <boxGeometry args={[1, 10, 50]} />
          <meshLambertMaterial color="#222222" />
        </mesh>
        
        <mesh position={[25, 5, 0]} receiveShadow>
          <boxGeometry args={[1, 10, 50]} />
          <meshLambertMaterial color="#222222" />
        </mesh>
      </Canvas>
    </>
  );
};

export default HorrorScene;