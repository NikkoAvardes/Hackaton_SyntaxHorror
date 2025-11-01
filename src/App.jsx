import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

console.log('App.jsx загружен');

// FPS контроллер
function FirstPersonControls({ onMove }) {
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
        case 'KeyW': setMoveForward(true); break;
        case 'KeyA': setMoveLeft(true); break;
        case 'KeyS': setMoveBackward(true); break;
        case 'KeyD': setMoveRight(true); break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW': setMoveForward(false); break;
        case 'KeyA': setMoveLeft(false); break;
        case 'KeyS': setMoveBackward(false); break;
        case 'KeyD': setMoveRight(false); break;
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

    // Фиксируем высоту камеры (не ходим по потолку!)
    camera.position.y = 0.1; // Высота человека

    // Ограничиваем движение границами комнаты
    const boundary = 14; // Границы комнаты (стены на расстоянии 15)
    camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
    camera.position.z = Math.max(-boundary, Math.min(boundary, camera.position.z));

    if (onMove) {
      onMove(camera.position);
    }
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
}

// Компонент для загрузки GLB модели
function GLBModel({ path }) {
  try {
    const { scene } = useGLTF(path);
    
    useEffect(() => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Немного осветляем материалы для лучшей видимости
            if (child.material) {
              child.material.color.multiplyScalar(0.8);
            }
          }
        });
      }
    }, [scene]);

    return scene ? <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} /> : null;
  } catch (error) {
    console.log('GLB модель не найдена:', path);
    return null;
  }
}

// Простая комната (fallback)
function Room() {
  return (
    <group>
      {/* Пол - светлее */}
      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#333333" />
      </mesh>

      {/* Стены - светлее */}
      <mesh position={[0, 5, -15]}>
        <boxGeometry args={[30, 10, 1]} />
        <meshLambertMaterial color="#444444" />
      </mesh>
      
      <mesh position={[0, 5, 15]}>
        <boxGeometry args={[30, 10, 1]} />
        <meshLambertMaterial color="#444444" />
      </mesh>
      
      <mesh position={[-15, 5, 0]}>
        <boxGeometry args={[1, 10, 30]} />
        <meshLambertMaterial color="#444444" />
      </mesh>
      
      <mesh position={[15, 5, 0]}>
        <boxGeometry args={[1, 10, 30]} />
        <meshLambertMaterial color="#444444" />
      </mesh>

      {/* Потолок - светлее */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#222222" />
      </mesh>

      {/* Объекты для триггеров - ярче */}
      <mesh position={[8, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color="#cc0000" />
      </mesh>
      
      <mesh position={[-8, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color="#00cc00" />
      </mesh>
      
      <mesh position={[0, 0, -8]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color="#0000cc" />
      </mesh>
    </group>
  );
}

// Основная игровая сцена
function HorrorScene({ onTrigger }) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1.6, 5));
  
  const checkTriggers = (position) => {
    const triggers = [
      { pos: [8, 0, 0], radius: 3, id: 'red', triggered: false },
      { pos: [-8, 0, 0], radius: 3, id: 'green', triggered: false },
      { pos: [0, 0, -8], radius: 3, id: 'blue', triggered: false }
    ];

    triggers.forEach((trigger) => {
      if (!trigger.triggered) {
        const distance = position.distanceTo(new THREE.Vector3(...trigger.pos));
        if (distance < trigger.radius) {
          trigger.triggered = true;
          onTrigger(trigger.id);
        }
      }
    });
  };

  const handleMove = (position) => {
    setPlayerPosition(position.clone());
    checkTriggers(position);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Улучшенное освещение - ярче */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.9}
          color="#ffffff"
          castShadow
        />
        <pointLight
          position={[0, 3, 0]}
          intensity={0.8}
          color="#ffeeee"
          distance={25}
        />
        {/* Дополнительные источники света */}
        <pointLight
          position={[8, 2, 0]}
          intensity={0.4}
          color="#ff6666"
          distance={10}
        />
        <pointLight
          position={[-8, 2, 0]}
          intensity={0.4}
          color="#66ff66"
          distance={10}
        />
        <pointLight
          position={[0, 2, -8]}
          intensity={0.4}
          color="#6666ff"
          distance={10}
        />

        {/* FPS управление */}
        <FirstPersonControls onMove={handleMove} />

        {/* GLB модель (если есть) */}
        <GLBModel path="/10_31_2025.glb" />

        {/* Fallback комната */}
        <Room />
      </Canvas>

      {/* Инструкции */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ff6666' }}>🎮 Управление</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>W, A, S, D - Движение</li>
          <li>Мышь - Обзор</li>
          <li>Клик - Захват мыши</li>
          <li>ESC - Освободить мышь</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#888', margin: '10px 0 0 0' }}>
          Позиция: X:{playerPosition.x.toFixed(1)} Z:{playerPosition.z.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

// Простой скример
function ScreamerEffect({ triggerId, onClose }) {
  const effects = {
    red: "💀 КРАСНАЯ ЗОНА! 💀",
    green: "🩸 ЗЕЛЕНАЯ ЗОНА! 🩸",
    blue: "👁️ СИНЯЯ ЗОНА! 👁️"
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        fontSize: '4rem',
        color: '#fff',
        textShadow: '0 0 10px #ff0000',
        textAlign: 'center'
      }}>
        {effects[triggerId] || "👻 НАЙДЕНО! 👻"}
      </div>
    </div>
  );
}

function App() {
  console.log('App рендерится');
  const [gameStarted, setGameStarted] = useState(false);
  const [showScreamer, setShowScreamer] = useState(false);
  const [triggerId, setTriggerId] = useState(null);

  const handleTrigger = (id) => {
    console.log('Триггер активирован:', id);
    setTriggerId(id);
    setShowScreamer(true);
  };

  const closeScreamer = () => {
    setShowScreamer(false);
    setTriggerId(null);
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <div className="start-screen">
          <h1>SYNTAX HORROR</h1>
          <p>Базовая версия - проверяем работу</p>
          <button 
            className="start-button" 
            onClick={() => {
              console.log('Игра запущена');
              setGameStarted(true);
            }}
          >
            🎮 Тест
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <HorrorScene onTrigger={handleTrigger} />
      
      {showScreamer && (
        <ScreamerEffect triggerId={triggerId} onClose={closeScreamer} />
      )}
      
      <button 
        onClick={() => setGameStarted(false)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '10px 20px',
          background: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🏠 Выход
      </button>
    </div>
  );
}

export default App;