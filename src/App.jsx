import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

console.log('App.jsx загружен');

// FPS контроллер
function FirstPersonControls({ onMove, currentRoom }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  // 🎯 КОНФИГУРАЦИЯ ПОЗИЦИЙ ДЛЯ КАЖДОЙ КОМНАТЫ 🎯
  // spawn: [X, Y, Z] - позиция появления при входе в комнату  
  // height: Y - высота камеры во время игры
  const roomPositions = {
    chambre1: {
      spawn: [-1, 0.1, -3.5],    // X: право/лево, Y: высота, Z: вперед/назад
      height: -1.6               // Высота во время игры (стандартная)
    },
    chambre2: {
      spawn: [2.40, 0.1, 3.60],   // Центр комнаты, немного вперед  
      height: -0.3               // Высота во время игры (ИЗМЕНИТЕ ДЛЯ РЕГУЛИРОВКИ)
    },
    chambreWC: {
      spawn: [2, 0.1, -0.50],    // Position d'entrée depuis chambre2
      height: -0.6              // Hauteur vo время игры
    },
    chambre3: {
      spawn: [0, 0.1, 5],        // Центр комнаты
      height: 0.1               // Высота во время игры (финальная комната)
    }
  };
  
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

    // Фиксируем высоту камеры в зависимости от помещения
    const roomHeight = roomPositions[currentRoom]?.height || -1.6;
    camera.position.y = roomHeight;

    // Динамические границы в зависимости от помещения
    let boundaries = { minX: -14, maxX: 14, minZ: -14, maxZ: 14 }; // Значения по умолчанию

    switch (currentRoom) {
      case 'chambre1':
        boundaries = { minX: -1.3, maxX: 1.3, minZ: -3.5, maxZ: -2.3 };
        break;
      case 'chambre2':
        boundaries = { minX: -10, maxX: 10, minZ: -12, maxZ: 6 };
        break;
      case 'chambreWC':
        boundaries = { minX: -2, maxX: 8, minZ: -2, maxZ: 8 };
        break;
      case 'chambre3':
        boundaries = { minX: -12, maxX: 12, minZ: -12, maxZ: 12 };
        break;
      default:
        boundaries = { minX: -14, maxX: 14, minZ: -14, maxZ: 14 };
    }

    // Применяем границы
    camera.position.x = Math.max(boundaries.minX, Math.min(boundaries.maxX, camera.position.x));
    camera.position.z = Math.max(boundaries.minZ, Math.min(boundaries.maxZ, camera.position.z));

    if (onMove) {
      onMove(camera.position);
    }
  });

  // Effet pour repositionner la caméra lors du changement de chambre
  useEffect(() => {
    const spawnPosition = roomPositions[currentRoom]?.spawn;
    if (spawnPosition) {
      camera.position.set(...spawnPosition);
      console.log(`📍 Позиция установлена для ${currentRoom}:`, spawnPosition);
    }
  }, [currentRoom, camera]);

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
}

// Компонент для загрузки GLB модели
function GLBModel({ path, visible = true }) {
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

    return scene && visible ? <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} /> : null;
  } catch (error) {
    console.log('GLB модель не найдена:', path);
    return null;
  }
}

// Компонент кодового замка
function CodeLock({ isVisible, onSuccess, onClose }) {
  const [code, setCode] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const correctCode = '1234';

  const handleInput = (digit) => {
    if (code.length < 4) {
      const newCode = code + digit;
      setCode(newCode);
      
      if (newCode.length === 4) {
        if (newCode === correctCode) {
          console.log('✅ Правильный код!');
          setTimeout(() => {
            onSuccess();
            setCode('');
          }, 500);
        } else {
          console.log('❌ Неправильный код');
          setIsWrong(true);
          setTimeout(() => {
            setCode('');
            setIsWrong(false);
          }, 1000);
        }
      }
    }
  };

  const handleClear = () => {
    setCode('');
    setIsWrong(false);
  };

  // Обработчик ESC для закрытия кодового замка
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.code === 'Escape' && isVisible) {
        console.log('🚪 ESC в кодовом замке - закрываем');
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isVisible, onClose]);

  // Управление курсором мыши при открытии/закрытии кодового замка
  useEffect(() => {
    if (isVisible) {
      // При открытии кода - освобождаем курсор
      document.exitPointerLock();
      console.log('🖱️ Курсор освобожден для ввода кода');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        cursor: 'default' // Показываем обычный курсор
      }}
      onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие событий
      onMouseDown={(e) => e.preventDefault()} // Предотвращаем захват курсора
    >
      <div 
        style={{
          background: '#333',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #666',
          textAlign: 'center',
          color: 'white'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
      >
        <h2 style={{ margin: '0 0 20px 0', color: '#ff6666' }}>🔒 КОДОВЫЙ ЗАМОК</h2>
        <div style={{
          fontSize: '24px',
          margin: '20px 0',
          padding: '10px',
          background: '#222',
          border: isWrong ? '2px solid #ff0000' : '2px solid #666',
          borderRadius: '5px',
          fontFamily: 'monospace',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {code.replace(/./g, '*') || (isWrong ? 'ОШИБКА!' : '----')}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          margin: '20px 0'
        }}>
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleInput(num.toString());
              }}
              onMouseDown={(e) => e.preventDefault()} // Предотвращаем захват курсора
              style={{
                padding: '15px',
                fontSize: '18px',
                background: '#555',
                color: 'white',
                border: '1px solid #777',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.background = '#777'}
              onMouseOut={(e) => e.target.style.background = '#555'}
            >
              {num}
            </button>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              padding: '15px',
              fontSize: '16px',
              background: '#cc3333',
              color: 'white',
              border: '1px solid #777',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#ff3333'}
            onMouseOut={(e) => e.target.style.background = '#cc3333'}
          >
            C
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleInput('0');
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              padding: '15px',
              fontSize: '18px',
              background: '#555',
              color: 'white',
              border: '1px solid #777',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#777'}
            onMouseOut={(e) => e.target.style.background = '#555'}
          >
            0
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              padding: '15px',
              fontSize: '16px',
              background: '#666',
              color: 'white',
              border: '1px solid #777',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#888'}
            onMouseOut={(e) => e.target.style.background = '#666'}
          >
            ESC
          </button>
        </div>
      </div>
    </div>
  );
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
function HorrorScene({ onTrigger, currentRoom, onDoorInteraction, onCodeClose, onRoomChange }) {
  /* 
  ================================================
  🎯 РУКОВОДСТВО ПО НАСТРОЙКЕ ПОЗИЦИЙ КОМНАТ 🎯
  ================================================
  
  Для изменения позиций каждой комнаты измените значения ниже:
  
  spawn: [X, Y, Z] - Позиция появления при входе в комнату
    X: отрицательные = влево, положительные = вправо
    Y: отрицательные = ниже, положительные = выше 
    Z: отрицательные = назад, положительные = вперед
    
  height: Высота камеры во время игры
    -1.6 = стандартная высота человека
    -0.5 = выше стандартной
    -3.0 = ниже стандартной
    
  Примеры:
  - Для chambre2: если бегаете под землей, увеличьте height до -0.5 или 0.1
  - Для spawn: если появляетесь в стене, измените X или Z координаты
  ================================================
  */
  
  // 🎯 КОНФИГУРАЦИЯ ПОЗИЦИЙ ДЛЯ КАЖДОЙ КОМНАТЫ 🎯
  const roomPositions = {
    chambre1: {
      spawn: [-1, 0.1, -3.5],    // X: право/лево, Y: высота, Z: вперед/назад
      height: -1.6               // Высота во время игры (стандартная)
    },
    chambre2: {
      spawn: [2.40, 0.1, 3.60],   // Центр комнаты, немного вперед
      height: -1.6               // Высота во время игры (ИЗМЕНИТЕ ДЛЯ РЕГУЛИРОВКИ)
    },
    chambreWC: {
      spawn: [2, 0.1, -0.50],    // Position d'entrée depuis chambre2
      height: -1.6               // Высота во время игры
    },
    chambre3: {
      spawn: [0, 0.1, 5],        // Центр комнаты
      height: -1.6               // Высота во время игры (финальная комната)
    }
  };

  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(...roomPositions.chambre1.spawn)
  );
  const [nearDoor, setNearDoor] = useState(false);
  const [nearDirectDoor, setNearDirectDoor] = useState(false); // Для прямой двери в chambre3
  
  // Effet pour mettre à jour la position du joueur lors du changement de chambre
  useEffect(() => {
    const spawnPosition = roomPositions[currentRoom]?.spawn;
    if (spawnPosition) {
      setPlayerPosition(new THREE.Vector3(...spawnPosition));
      console.log(`🎯 Position joueur mise à jour pour ${currentRoom}:`, spawnPosition);
    }
  }, [currentRoom]);
  
  const checkTriggers = (position) => {
    // Триггеры только в последнем помещении (chambre3)
    if (currentRoom === 'chambre3') {
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
    }
    
    // Проверка двери в chambre1 (переход в chambre2 с кодом)
    if (currentRoom === 'chambre1') {
      const doorPosition = new THREE.Vector3(0, 0, 0); // Позиция двери
      const distanceToDoor = position.distanceTo(doorPosition);
      
      if (distanceToDoor < 3) {
        if (!nearDoor) {
          setNearDoor(true);
          console.log('🚪 Дверь chambre1→chambre2 - код требуется');
        }
      } else {
        if (nearDoor) {
          setNearDoor(false);
          console.log('🚪 Отошли от двери chambre1');
          onCodeClose();
        }
      }
    }
    
    // Проверка дверей в chambre2
    else if (currentRoom === 'chambre2') {
      // Дверь в chambreWC (с кодом)
      const doorWCPosition = new THREE.Vector3(0.00, 0, -4.15);
      const distanceToWCDoor = position.distanceTo(doorWCPosition);
      
      // Прямая дверь в chambre3 (без кода)
      const directDoorPosition = new THREE.Vector3(-2.45, 0, -3.60);
      const distanceToDirectDoor = position.distanceTo(directDoorPosition);
      
      // Проверка двери в chambreWC
      if (distanceToWCDoor < 0.5) {
        if (!nearDoor) {
          setNearDoor(true);
          setNearDirectDoor(false); // Сбрасываем другую дверь
          console.log('🚪 Дверь chambre2→chambreWC - код требуется');
        }
      } 
      // Проверка прямой двери в chambre3
      else if (distanceToDirectDoor < 0.5) {
        if (!nearDirectDoor) {
          setNearDirectDoor(true);
          setNearDoor(false); // Сбрасываем другую дверь
          console.log('🚪 Прямая дверь chambre2→chambre3 - нажмите F');
          console.log(`🔍 DEBUG: Позиция игрока: X:${position.x.toFixed(2)}, Z:${position.z.toFixed(2)}`);
          console.log(`🔍 DEBUG: Позиция двери: X:-2.45, Z:-3.60`);
          console.log(`🔍 DEBUG: Расстояние: ${distanceToDirectDoor.toFixed(2)}`);
        }
      } 
      // Далеко от обеих дверей
      else {
        if (nearDoor) {
          setNearDoor(false);
          console.log('🚪 Отошли от двери chambre2→chambreWC');
          onCodeClose();
        }
        if (nearDirectDoor) {
          setNearDirectDoor(false);
          console.log('🚪 Отошли от прямой двери chambre2→chambre3');
        }
      }
    }
    
    // Проверка двери в chambreWC (переход в chambre3 без кода)
    else if (currentRoom === 'chambreWC') {
      const doorPosition = new THREE.Vector3(5, 0, 5); // Позиция двери в WC
      const distanceToDoor = position.distanceTo(doorPosition);
      
      if (distanceToDoor < 2) {
        console.log('🚪 Переходим в chambre3 автоматически');
        onRoomChange('chambre3');
      }
    }
    
    else {
      // В других случаях сбрасываем состояние
      if (nearDoor) {
        setNearDoor(false);
        onCodeClose();
      }
    }
  };

  const handleMove = (position) => {
    setPlayerPosition(position.clone());
    checkTriggers(position);
  };

  // Обработчик клавиш F (активация) и ESC (закрытие) для кода
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Обработка двери с кодом (chambre1 → chambre2, chambre2 → chambreWC)
      if (nearDoor && (currentRoom === 'chambre1' || currentRoom === 'chambre2')) {
        if (event.code === 'KeyF') {
          event.preventDefault();
          console.log(`🔑 Клавиша F нажата в ${currentRoom} - активируем кодовый замок!`);
          onDoorInteraction();
        } else if (event.code === 'Escape') {
          event.preventDefault();
          console.log(`🚪 ESC нажата в ${currentRoom} - закрываем кодовый замок!`);
          onCodeClose();
        }
      }
      
      // Обработка прямой двери в chambre3 (без кода)
      if (nearDirectDoor && currentRoom === 'chambre2') {
        if (event.code === 'KeyF') {
          event.preventDefault();
          console.log('🚪 Открываем прямую дверь chambre2 → chambre3');
          console.log('🔍 DEBUG: onRoomChange доступен?', typeof onRoomChange);
          console.log('🔍 DEBUG: Вызываем onRoomChange("chambre3")');
          onRoomChange('chambre3');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [nearDoor, nearDirectDoor, currentRoom, onDoorInteraction, onCodeClose, onRoomChange]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ 
          position: roomPositions[currentRoom]?.spawn || [0, 0.1, 5], 
          fov: 72
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Улучшенное освещение */}
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
        
        {/* Дополнительные источники света для chambre3 (с триггерами) */}
        {currentRoom === 'chambre3' && (
          <>
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
          </>
        )}
        
        {/* Специальное освещение для WC */}
        {currentRoom === 'chambreWC' && (
          <pointLight
            position={[3, 2, 3]}
            intensity={0.3}
            color="#ffffff"
            distance={8}
          />
        )}

        {/* FPS управление */}
        <FirstPersonControls onMove={handleMove} currentRoom={currentRoom} />

        {/* GLB модели для всех помещений */}
        <GLBModel path="/chambre1.glb" visible={currentRoom === 'chambre1'} />
        <GLBModel path="/chambre2.glb" visible={currentRoom === 'chambre2'} />
        <GLBModel path="/chambreWC.glb" visible={currentRoom === 'chambreWC'} />
        <GLBModel path="/chambre3.glb" visible={currentRoom === 'chambre3'} />

        {/* Fallback комната только для chambre3 (с триггерами) */}
        {currentRoom === 'chambre3' && <Room />}
        
        {/* Fallback двери (если нет GLB моделей) */}
        {currentRoom === 'chambre1' && (
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 3, 0.2]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        )}
        
        {currentRoom === 'chambre2' && (
          <mesh position={[0, 1, -8]}>
            <boxGeometry args={[2, 3, 0.2]} />
            <meshLambertMaterial color="#654321" />
          </mesh>
        )}
        
        {currentRoom === 'chambreWC' && (
          <mesh position={[5, 1, 5]}>
            <boxGeometry args={[1.5, 2.5, 0.2]} />
            <meshLambertMaterial color="#4A4A4A" />
          </mesh>
        )}
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
        <h3 style={{ margin: '0 0 10px 0', color: '#ff6666' }}>
          🎮 Управление - {
            currentRoom === 'chambre1' ? 'Chambre 1 (Старт)' :
            currentRoom === 'chambre2' ? 'Chambre 2' :
            currentRoom === 'chambreWC' ? 'Chambre WC' :
            currentRoom === 'chambre3' ? 'Chambre 3 (Финал)' : currentRoom
          }
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>W, A, S, D - Движение</li>
          <li>Мышь - Обзор</li>
          <li>Клик - Захват мыши</li>
          <li>ESC - Освободить мышь</li>
          {currentRoom === 'chambre1' && <li>🚪 [F] - код для входа в Chambre 2</li>}
          {currentRoom === 'chambre2' && <li>🚪 [F] - код для входа в WC</li>}
          {currentRoom === 'chambre2' && <li>🔓 [F] - прямой проход в Chambre 3 (X:-2.45, Z:-3.60)</li>}
          {currentRoom === 'chambreWC' && <li>🚪 Подойдите к двери → автоматический переход в Chambre 3</li>}
          {currentRoom === 'chambre3' && <li>👻 Найдите триггеры для скримеров!</li>}
        </ul>
        
        {/* Debug panel for boundaries */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#66ccff'
        }}>
          <strong>🔧 Отладка границ:</strong><br/>
          Текущие координаты: X: {playerPosition.x.toFixed(2)}, Z: {playerPosition.z.toFixed(2)}<br/>
          Границы комнаты: {
            currentRoom === 'chambre1' ? 'X: ±8, Z: ±8' :
            currentRoom === 'chambre2' ? 'X: -10→10, Z: -12→6' :
            currentRoom === 'chambreWC' ? 'X: -2→8, Z: -2→8' :
            currentRoom === 'chambre3' ? 'X: ±12, Z: ±12' :
            'неизвестно'
          }
        </div>
        
        <p style={{ fontSize: '12px', color: '#888', margin: '10px 0 0 0' }}>
          Позиция: X:{playerPosition.x.toFixed(1)} Z:{playerPosition.z.toFixed(1)}
        </p>
        <button 
          onClick={() => onTrigger('red')}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            background: '#ff3333',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔊 Тест звука
        </button>
      </div>

      {/* Уведомление о возможности активации кода */}
      {nearDoor && (currentRoom === 'chambre1' || currentRoom === 'chambre2') && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: '#ffff00',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #ffff00',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1500,
          animation: 'pulse 2s infinite'
        }}>
          🔑 ДВЕРЬ НАЙДЕНА!<br/>
          <span style={{ fontSize: '14px' }}>
            {currentRoom === 'chambre1' ? 'Переход в Chambre 2' : 'Переход в WC'}<br/>
            [F] - открыть код | [ESC] - закрыть
          </span>
        </div>
      )}

      {/* Уведомление о прямой двери в chambre3 */}
      {nearDirectDoor && currentRoom === 'chambre2' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,100,0,0.9)',
          color: '#00ff00',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #00ff00',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1500,
          animation: 'pulse 2s infinite'
        }}>
          🚪 ПРЯМОЙ ПРОХОД!<br/>
          <span style={{ fontSize: '14px' }}>
            Переход в Chambre 3<br/>
            [F] - открыть дверь
          </span>
        </div>
      )}
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
  const [audioContext, setAudioContext] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('chambre1'); // Начинаем с первого помещения (chambre1)
  const [showCodeLock, setShowCodeLock] = useState(false);

  // Инициализация звука при первом клике
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContext) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          setAudioContext(ctx);
          console.log('✅ Аудио контекст создан и активирован:', ctx.state);
          
          // Тестовый звук для проверки
          const testOsc = ctx.createOscillator();
          const testGain = ctx.createGain();
          testOsc.connect(testGain);
          testGain.connect(ctx.destination);
          testOsc.frequency.setValueAtTime(440, ctx.currentTime);
          testGain.gain.setValueAtTime(0.1, ctx.currentTime);
          testGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          testOsc.start(ctx.currentTime);
          testOsc.stop(ctx.currentTime + 0.1);
          console.log('🔊 Тестовый звук воспроизведен');
        } catch (error) {
          console.error('❌ Ошибка создания аудио контекста:', error);
        }
      }
    };

    const handleFirstInteraction = () => {
      console.log('👆 Первое взаимодействие - инициализируем звук');
      initAudio();
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioContext]);

  const handleDoorInteraction = () => {
    console.log('🚪 Игрок подошел к двери');
    setShowCodeLock(true);
  };

  const handleCodeSuccess = () => {
    let nextRoom = '';
    
    if (currentRoom === 'chambre1') {
      nextRoom = 'chambre2';
      console.log('✅ Код правильный - переходим из chambre1 в chambre2');
    } else if (currentRoom === 'chambre2') {
      nextRoom = 'chambreWC';
      console.log('✅ Код правильный - переходим из chambre2 в chambreWC');
    }
    
    setCurrentRoom(nextRoom);
    setShowCodeLock(false);
    
    // Позиционируем игрока в правильное место для новой комнаты
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Получаем Canvas из React Three Fiber и позиционируем камеру
        const scene = canvas.__reactInternalInstance || canvas._reactInternalFiber;
        if (scene) {
          // Принудительно обновляем позицию камеры для новой комнаты
          console.log(`📍 Позиционируем игрока в ${nextRoom}`);
          
          // Перехват следующего кадра для принудительного обновления
          const updatePosition = () => {
            // Триггерим обновление компонента
            window.dispatchEvent(new CustomEvent('forcePositionUpdate', { detail: nextRoom }));
          };
          
          requestAnimationFrame(updatePosition);
        }
        
        canvas.requestPointerLock();
        console.log(`🖱️ Курсор захвачен для ${nextRoom}`);
      }
    }, 100);
  };

  const handleCodeClose = () => {
    setShowCodeLock(false);
    // Повторно захватываем курсор для FPS управления
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.requestPointerLock();
        console.log('🖱️ Курсор захвачен обратно для FPS');
      }
    }, 100); // Небольшая задержка для корректного захвата
  };

  // Ужасный звук скримера
  const playScreamerSound = async (type) => {
    console.log('🎵 Пытаемся воспроизвести звук скримера:', type);
    
    if (!audioContext) {
      console.warn('❌ Аудио контекст не инициализирован');
      return;
    }
    
    if (audioContext.state === 'suspended') {
      console.log('🔄 Активируем аудио контекст...');
      await audioContext.resume();
    }
    
    console.log('✅ Состояние аудио контекста:', audioContext.state);
    
    try {
      // Создаем несколько слоев ужасного звука
      const now = audioContext.currentTime;
      
      // Основной страшный звук - низкая частота
      const oscillator1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      oscillator1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(100, now);
      oscillator1.frequency.exponentialRampToValueAtTime(50, now + 0.5);
      oscillator1.frequency.exponentialRampToValueAtTime(200, now + 1);
      
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      
      oscillator1.start(now);
      oscillator1.stop(now + 1.5);
      console.log('🔊 Основной звук запущен');

      // Высокий пронзительный звук
      const oscillator2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      oscillator2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1000, now + 0.2);
      oscillator2.frequency.exponentialRampToValueAtTime(2000, now + 0.4);
      oscillator2.frequency.exponentialRampToValueAtTime(500, now + 0.8);
      
      gain2.gain.setValueAtTime(0.2, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 1);
      
      oscillator2.start(now + 0.2);
      oscillator2.stop(now + 1);
      console.log('🔊 Высокий звук запущен');

      // Женский крик - имитация голоса
      const screamOsc1 = audioContext.createOscillator();
      const screamOsc2 = audioContext.createOscillator();
      const screamGain = audioContext.createGain();
      
      // Создаем фильтр для более естественного звучания
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(5, now);
      
      screamOsc1.connect(filter);
      screamOsc2.connect(filter);
      filter.connect(screamGain);
      screamGain.connect(audioContext.destination);
      
      // Первый осциллятор - основная частота крика (женский голос)
      screamOsc1.frequency.setValueAtTime(600, now);
      screamOsc1.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      screamOsc1.frequency.exponentialRampToValueAtTime(800, now + 0.8);
      screamOsc1.frequency.exponentialRampToValueAtTime(400, now + 1.2);
      
      // Второй осциллятор - гармоники для реалистичности
      screamOsc2.frequency.setValueAtTime(1200, now);
      screamOsc2.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
      screamOsc2.frequency.exponentialRampToValueAtTime(1600, now + 0.8);
      screamOsc2.frequency.exponentialRampToValueAtTime(800, now + 1.2);
      
      // Огибающая крика - начинается резко, затухает
      screamGain.gain.setValueAtTime(0.4, now);
      screamGain.gain.setValueAtTime(0.6, now + 0.1);
      screamGain.gain.exponentialRampToValueAtTime(0.3, now + 0.5);
      screamGain.gain.exponentialRampToValueAtTime(0.1, now + 0.9);
      screamGain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);
      
      screamOsc1.start(now);
      screamOsc1.stop(now + 1.3);
      screamOsc2.start(now);
      screamOsc2.stop(now + 1.3);
      console.log('🔊 Женский крик запущен');

      // Дополнительный эффект в зависимости от типа
      if (type === 'red') {
        // Красная зона - прерывистый крик с паникой
        for (let i = 0; i < 4; i++) {
          const panicScream = audioContext.createOscillator();
          const panicGain = audioContext.createGain();
          const panicFilter = audioContext.createBiquadFilter();
          
          panicFilter.type = 'highpass';
          panicFilter.frequency.setValueAtTime(400, now + i * 0.2);
          
          panicScream.connect(panicFilter);
          panicFilter.connect(panicGain);
          panicGain.connect(audioContext.destination);
          
          panicScream.frequency.setValueAtTime(700 + i * 100, now + i * 0.2);
          panicScream.frequency.exponentialRampToValueAtTime(1400, now + i * 0.2 + 0.15);
          
          panicGain.gain.setValueAtTime(0.3, now + i * 0.2);
          panicGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.15);
          
          panicScream.start(now + i * 0.2);
          panicScream.stop(now + i * 0.2 + 0.15);
        }
      } else if (type === 'green') {
        // Зеленая зона - долгий протяжный крик
        const longScream = audioContext.createOscillator();
        const longGain = audioContext.createGain();
        const tremolo = audioContext.createOscillator();
        const tremoloGain = audioContext.createGain();
        
        tremolo.frequency.setValueAtTime(8, now); // Тремоло эффект
        tremolo.connect(tremoloGain);
        tremoloGain.gain.setValueAtTime(0.3, now);
        
        longScream.connect(longGain);
        longGain.connect(audioContext.destination);
        tremoloGain.connect(longGain.gain);
        
        longScream.frequency.setValueAtTime(900, now);
        longScream.frequency.linearRampToValueAtTime(1100, now + 0.5);
        longScream.frequency.linearRampToValueAtTime(800, now + 1.2);
        
        longGain.gain.setValueAtTime(0.35, now);
        longGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        tremolo.start(now);
        tremolo.stop(now + 1.5);
        longScream.start(now);
        longScream.stop(now + 1.5);
      } else if (type === 'blue') {
        // Синяя зона - эхо крика с реверберацией
        for (let i = 0; i < 3; i++) {
          const echoScream = audioContext.createOscillator();
          const echoGain = audioContext.createGain();
          const echoFilter = audioContext.createBiquadFilter();
          
          echoFilter.type = 'lowpass';
          echoFilter.frequency.setValueAtTime(1000 - i * 200, now + i * 0.4);
          
          echoScream.connect(echoFilter);
          echoFilter.connect(echoGain);
          echoGain.connect(audioContext.destination);
          
          echoScream.frequency.setValueAtTime(600 - i * 50, now + i * 0.4);
          echoScream.frequency.exponentialRampToValueAtTime(1000 - i * 100, now + i * 0.4 + 0.6);
          
          echoGain.gain.setValueAtTime(0.25 - i * 0.05, now + i * 0.4);
          echoGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.4 + 0.8);
          
          echoScream.start(now + i * 0.4);
          echoScream.stop(now + i * 0.4 + 0.8);
        }
      }
    
    } catch (error) {
      console.error('❌ Ошибка воспроизведения звука:', error);
    }
  };

  const handleTrigger = (id) => {
    console.log('Триггер активирован:', id);
    setTriggerId(id);
    setShowScreamer(true);
    
    // Играем ужасный звук
    playScreamerSound(id);
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
          <p>Двухуровневая система - Первое помещение → Код → Второе помещение</p>
          <button 
            className="start-button" 
            onClick={() => {
              console.log('Игра запущена');
              setGameStarted(true);
            }}
          >
            🎮 Начать
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <HorrorScene 
        onTrigger={handleTrigger} 
        currentRoom={currentRoom}
        onDoorInteraction={handleDoorInteraction}
        onCodeClose={handleCodeClose}
        onRoomChange={setCurrentRoom}
      />
      
      {showScreamer && (
        <ScreamerEffect triggerId={triggerId} onClose={closeScreamer} />
      )}
      
      {showCodeLock && (
        <CodeLock 
          isVisible={showCodeLock}
          onSuccess={handleCodeSuccess}
          onClose={handleCodeClose}
        />
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
      
      {currentRoom !== 'chambre1' && (
        <button 
          onClick={() => setCurrentRoom('chambre1')}
          style={{
            position: 'absolute',
            top: 70,
            right: 20,
            padding: '10px 20px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          🚪 В Chambre 1
        </button>
      )}
    </div>
  );
}

export default App;