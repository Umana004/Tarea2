import React, { useState, useEffect, useRef } from 'react';
import './TrafficSimulation.css';

const TrafficSimulation = () => {
  const [state, setState] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [cycleDuration, setCycleDuration] = useState(10);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const eventsRef = useRef([]);

  // Conectar al servidor WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('✓ Conectado al servidor');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'init':
        case 'state':
          setState(data.state);
          if (data.vehicles) setVehicles(data.vehicles);
          break;
        case 'update':
          setState(data.state);
          setVehicles(data.vehicles || []);
          break;
        case 'event':
          addEvent(data.event);
          break;
        default:
          break;
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('✗ Desconectado del servidor');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const addEvent = (event) => {
    const formattedEvent = `[${formatTime(event.timestamp)}] ${formatEventMessage(event)}`;
    eventsRef.current = [formattedEvent, ...eventsRef.current].slice(0, 20);
    setEvents([...eventsRef.current]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
  };

  const formatEventMessage = (event) => {
    switch (event.type) {
      case 'system_started':
        return '🟢 Sistema iniciado';
      case 'system_paused':
        return '⏸️  Sistema pausado';
      case 'system_reset':
        return '🔄 Sistema reiniciado';
      case 'phase_changed':
        const phase = event.data.phase;
        const phases = ['Nord-Sud: VERDE', 'Nord-Sud: AMARILLO', 'Este-Oeste: VERDE', 'Este-Oeste: AMARILLO'];
        return `Transición a ${phases[phase] || 'fase desconocida'}`;
      case 'cycle_completed':
        return `✓ Ciclo completado (${event.data.cycles} ciclos)`;
      default:
        return event.type;
    }
  };

  const sendCommand = (command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    }
  };

  const handleStart = () => sendCommand({ type: 'start' });
  const handlePause = () => sendCommand({ type: 'pause' });
  const handleReset = () => sendCommand({ type: 'reset' });
  const handleCycleDuration = (value) => {
    setCycleDuration(value);
    sendCommand({ type: 'setCycleDuration', duration: parseInt(value) });
  };

  const getLightColor = (state) => {
    switch (state) {
      case 'red':
        return '#e74c3c';
      case 'yellow':
        return '#f39c12';
      case 'green':
        return '#27ae60';
      default:
        return '#34495e';
    }
  };

  const renderIntersection = () => {
    return (
      <svg width="500" height="500" className="intersection">
        {/* Fondo con carreteras */}
        <g className="roads">
          {/* Carretera Norte-Sur (vertical) */}
          <rect x="180" y="0" width="140" height="500" fill="#555555" />
          {/* Carretera Este-Oeste (horizontal) */}
          <rect x="0" y="170" width="500" height="160" fill="#555555" />
          
          {/* Pasto */}
          <rect x="0" y="0" width="180" height="170" fill="#6b8e23" />
          <rect x="320" y="0" width="180" height="170" fill="#6b8e23" />
          <rect x="0" y="330" width="180" height="170" fill="#6b8e23" />
          <rect x="320" y="330" width="180" height="170" fill="#6b8e23" />
        </g>

        {/* Líneas de carretera */}
        <g className="road-markings" stroke="white" strokeWidth="2" strokeDasharray="10,10">
          {/* Líneas verticales */}
          <line x1="210" y1="0" x2="210" y2="500" />
          <line x1="290" y1="0" x2="290" y2="500" />
          
          {/* Líneas horizontales */}
          <line x1="0" y1="200" x2="500" y2="200" />
          <line x1="0" y1="270" x2="500" y2="270" />
        </g>

        {/* Pasos peatonales */}
        <g className="crossings">
          {/* Norte */}
          <g>{[0, 20, 40].map((i) => (
            <rect key={`cn${i}`} x={180 + i * 10} y="130" width="8" height="40" fill="#ddd" />
          ))}</g>
          {/* Sur */}
          <g>{[0, 20, 40].map((i) => (
            <rect key={`cs${i}`} x={180 + i * 10} y="330" width="8" height="40" fill="#ddd" />
          ))}</g>
          {/* Este */}
          <g>{[0, 20, 40].map((i) => (
            <rect key={`ce${i}`} x="330" y={170 + i * 10} width="40" height="8" fill="#ddd" />
          ))}</g>
          {/* Oeste */}
          <g>{[0, 20, 40].map((i) => (
            <rect key={`cw${i}`} x="130" y={170 + i * 10} width="40" height="8" fill="#ddd" />
          ))}</g>
        </g>

        {/* Vehículos */}
        <g className="vehicles">
          {vehicles.map((vehicle) => (
            <g key={vehicle.id}>
              {/* Cuerpo del carro */}
              <rect
                x={vehicle.x}
                y={vehicle.y}
                width={vehicle.width}
                height={vehicle.height}
                fill="#e74c3c"
                rx="2"
                opacity="0.9"
              />
              {/* Ventanas */}
              <rect
                x={vehicle.x + 5}
                y={vehicle.y + 2}
                width="7"
                height="4"
                fill="#87ceeb"
                rx="1"
              />
              <rect
                x={vehicle.x + 18}
                y={vehicle.y + 2}
                width="7"
                height="4"
                fill="#87ceeb"
                rx="1"
              />
            </g>
          ))}
        </g>

        {/* Semáforos */}
        {state && (
          <g className="traffic-lights">
            {/* Semáforo Norte */}
            <g transform="translate(330, 120)">
              <rect width="30" height="80" fill="#333" rx="3" />
              {['red', 'yellow', 'green'].map((color, idx) => (
                <circle
                  key={color}
                  cx="15"
                  cy={15 + idx * 25}
                  r="10"
                  fill={state.lights.norte.state === color ? getLightColor(color) : '#111'}
                />
              ))}
            </g>

            {/* Semáforo Sur */}
            <g transform="translate(330, 300)">
              <rect width="30" height="80" fill="#333" rx="3" />
              {['red', 'yellow', 'green'].map((color, idx) => (
                <circle
                  key={color}
                  cx="15"
                  cy={15 + idx * 25}
                  r="10"
                  fill={state.lights.sur.state === color ? getLightColor(color) : '#111'}
                />
              ))}
            </g>

            {/* Semáforo Este */}
            <g transform="translate(300, 330)">
              <rect width="80" height="30" fill="#333" rx="3" />
              {['red', 'yellow', 'green'].map((color, idx) => (
                <circle
                  key={color}
                  cx={15 + idx * 25}
                  cy="15"
                  r="10"
                  fill={state.lights.este.state === color ? getLightColor(color) : '#111'}
                />
              ))}
            </g>

            {/* Semáforo Oeste */}
            <g transform="translate(120, 330)">
              <rect width="80" height="30" fill="#333" rx="3" />
              {['red', 'yellow', 'green'].map((color, idx) => (
                <circle
                  key={color}
                  cx={15 + idx * 25}
                  cy="15"
                  r="10"
                  fill={state.lights.oeste.state === color ? getLightColor(color) : '#111'}
                />
              ))}
            </g>
          </g>
        )}

        {/* Etiquetas de direcciones */}
        <g className="labels" fontSize="14" fontWeight="bold" fill="white">
          <text x="430" y="90">NORTE</text>
          <text x="430" y="420">SUR</text>
          <text x="420" y="220">ESTE</text>
          <text x="50" y="220">OESTE</text>
        </g>
      </svg>
    );
  };

  const currentPhaseNames = [
    'Fase Norte - Sur: VERDE',
    'Fase Norte - Sur: AMARILLO',
    'Fase Este - Oeste: VERDE',
    'Fase Este - Oeste: AMARILLO'
  ];

  return (
    <div className="traffic-simulation">
      <div className="container">
        {/* Panel de control */}
        <div className="control-panel">
          <h2>CONTROLES</h2>
          
          <div className="button-group">
            <button 
              onClick={handleStart} 
              className="btn btn-start"
              disabled={!isConnected || (state && state.isRunning)}
            >
              ▶ Iniciar
            </button>
            <button 
              onClick={handlePause} 
              className="btn btn-pause"
              disabled={!isConnected || (state && !state.isRunning)}
            >
              ⏸ Pausar
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-reset"
              disabled={!isConnected}
            >
              🔄 Reiniciar
            </button>
          </div>

          <div className="slider-group">
            <label>Duración del ciclo (segundos)</label>
            <input
              type="range"
              min="2"
              max="10"
              value={cycleDuration}
              onChange={(e) => handleCycleDuration(e.target.value)}
              disabled={!isConnected}
            />
            <span>{cycleDuration}</span>
          </div>

          {state && (
            <>
              <div className="info-section">
                <p><strong>Fase actual:</strong></p>
                <p className="phase-name">{currentPhaseNames[state.currentPhase]}</p>
              </div>

              <div className="info-section">
                <p><strong>Sub-fase:</strong></p>
                <p className="light-state">
                  {state.lights.norte.state === 'green' || state.lights.sur.state === 'green' 
                    ? '🟢 Verde' 
                    : state.lights.norte.state === 'yellow' || state.lights.sur.state === 'yellow'
                    ? '🟡 Amarillo'
                    : '🔴 Rojo'}
                </p>
              </div>

              <div className="info-section">
                <p><strong>Ciclos completados:</strong></p>
                <p className="cycles">{state.cyclesCompleted}</p>
              </div>

              <div className="info-section">
                <p><strong>Tiempo transcurrido:</strong></p>
                <p className="time">{formatTime(state.systemTime)}</p>
              </div>

              <div className="legend">
                <div className="legend-item">
                  <div className="color-box red"></div>
                  <span>Rojo</span>
                </div>
                <div className="legend-item">
                  <div className="color-box yellow"></div>
                  <span>Amarillo</span>
                </div>
                <div className="legend-item">
                  <div className="color-box green"></div>
                  <span>Verde</span>
                </div>
              </div>
            </>
          )}

          <div className="status">
            {isConnected ? (
              <span className="connected">🟢 Conectado</span>
            ) : (
              <span className="disconnected">🔴 Desconectado</span>
            )}
          </div>
        </div>

        {/* Área de visualización */}
        <div className="simulation-area">
          {renderIntersection()}
          <p className="subtitle">Simulación de cruce de calles</p>
        </div>

        {/* Panel de eventos */}
        <div className="events-panel">
          <h2>EVENTOS DEL CONTROLADOR</h2>
          <div className="events-list">
            {events.length > 0 ? (
              events.map((event, idx) => (
                <div key={idx} className="event-item">
                  {event}
                </div>
              ))
            ) : (
              <div className="no-events">Esperando eventos...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSimulation;
