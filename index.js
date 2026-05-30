const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const { TrafficController } = require('./TrafficController');
const { VehicleManager } = require('./VehicleManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Controladores del sistema
const trafficController = new TrafficController();
const vehicleManager = new VehicleManager();

// Configuración del servidor
const PORT = process.env.PORT || 3001;
const TICK_RATE = 60; // frames por segundo
const TICK_INTERVAL = 1000 / TICK_RATE;

// Variables de control
let isSimulationRunning = false;
let simulationInterval = null;
let connectedClients = new Set();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './build')));

// Rutas API
app.get('/api/state', (req, res) => {
  res.json(trafficController.getSystemState());
});

// WebSocket manejo de conexiones
wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log(`Cliente conectado. Total: ${connectedClients.size}`);

  // Enviar estado inicial
  ws.send(JSON.stringify({
    type: 'init',
    state: trafficController.getSystemState(),
    vehicles: vehicleManager.getVehicles()
  }));

  // Manejo de mensajes del cliente
  ws.on('message', (message) => {
    try {
      const command = JSON.parse(message);
      handleCommand(command, ws);
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  // Manejo de desconexión
  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log(`Cliente desconectado. Total: ${connectedClients.size}`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Comandos del cliente
function handleCommand(command, ws) {
  switch (command.type) {
    case 'start':
      if (!trafficController.isRunning) {
        trafficController.start();
        startSimulation();
        broadcastState();
      }
      break;
    case 'pause':
      if (trafficController.isRunning) {
        trafficController.pause();
        broadcastState();
      }
      break;
    case 'reset':
      trafficController.reset();
      vehicleManager.vehicles = [];
      stopSimulation();
      broadcastState();
      break;
    case 'setCycleDuration':
      trafficController.setCycleDuration(command.duration);
      broadcastState();
      break;
    default:
      console.log('Comando desconocido:', command.type);
  }
}

// Bucle principal de simulación
function startSimulation() {
  if (simulationInterval) return;

  simulationInterval = setInterval(() => {
    // Actualizar controlador
    trafficController.tick(0.016); // ~16ms por frame

    // Configurar límites de intersección
    const intersectionLimits = {
      minX: 180,
      maxX: 320,
      minY: 170,
      maxY: 250
    };

    // Actualizar vehículos
    vehicleManager.update(trafficController, intersectionLimits);

    // Enviar actualizaciones a todos los clientes
    broadcastUpdate();
  }, TICK_INTERVAL);
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

// Emisión de actualizaciones a todos los clientes
function broadcastState() {
  const state = {
    type: 'state',
    state: trafficController.getSystemState()
  };
  broadcastToAll(state);
}

function broadcastUpdate() {
  const update = {
    type: 'update',
    state: trafficController.getSystemState(),
    vehicles: vehicleManager.getVehicles()
  };
  broadcastToAll(update);
}

function broadcastToAll(message) {
  const msg = JSON.stringify(message);
  connectedClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

// Escuchar eventos del controlador
trafficController.subscribe((event) => {
  // Emitir eventos importantes a los clientes
  if (event.type === 'phase_changed' || event.type === 'system_started') {
    const eventMsg = {
      type: 'event',
      event: event
    };
    broadcastToAll(eventMsg);
  }
});

// Iniciador del servidor
server.listen(PORT, () => {
  console.log(`🚦 Servidor de simulación de tráfico escuchando en http://localhost:${PORT}`);
  console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`);
});

module.exports = { app, server, trafficController, vehicleManager };
