# 🏗️ ARQUITECTURA DEL SISTEMA

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB (CLIENTE)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            REACT APPLICATION (Port 3000)                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  Control     │  │ Intersection │  │  Event Log   │  │   │
│  │  │  Panel       │  │   (SVG)      │  │              │  │   │
│  │  │              │  │              │  │              │  │   │
│  │  │ • Start      │  │ • Lights     │  │ [23:15:00]   │  │   │
│  │  │ • Pause      │  │ • Vehicles   │  │  Green N-S   │  │   │
│  │  │ • Reset      │  │ • Roads      │  │              │  │   │
│  │  │ • Slider     │  │              │  │ [23:15:02]   │  │   │
│  │  └──────────────┘  └──────────────┘  │  Yellow...   │  │   │
│  │                                       └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                          WebSocket                               │
│                       (bidireccional)                            │
│                              │                                    │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
         ┌────────▼─────────────────────────▼────────┐
         │      EXPRESS SERVER (Port 3001)           │
         ├───────────────────────────────────────────┤
         │                                            │
         │  ┌──────────────────────────────────────┐ │
         │  │   TrafficController (Orquestador)    │ │
         │  ├──────────────────────────────────────┤ │
         │  │                                      │ │
         │  │  ┌────────┐ ┌────────┐ ┌────────┐  │ │
         │  │  │NORTE   │ │ESTE    │ │SUR     │  │ │
         │  │  │(Light) │ │(Light) │ │(Light) │  │ │
         │  │  │RED/YEL │ │RED/YEL │ │RED/YEL │  │ │
         │  │  │/GREEN  │ │/GREEN  │ │/GREEN  │  │ │
         │  │  └────────┘ └────────┘ └────────┘  │ │
         │  │          ┌────────┐                │ │
         │  │          │OESTE   │                │ │
         │  │          │(Light) │                │ │
         │  │          │RED/YEL │                │ │
         │  │          │/GREEN  │                │ │
         │  │          └────────┘                │ │
         │  │                                      │ │
         │  │  ┌──────────────────────────────┐  │ │
         │  │  │  Lógica de Coordinación      │  │ │
         │  │  │  - Fase N-S VERDE (8s)       │  │ │
         │  │  │  - Fase N-S AMARILLO (2s)    │  │ │
         │  │  │  - Fase E-O VERDE (8s)       │  │ │
         │  │  │  - Fase E-O AMARILLO (2s)    │  │ │
         │  │  │                               │  │ │
         │  │  │  NUNCA N-S y E-O juntos      │  │ │
         │  │  │  en VERDE                     │  │ │
         │  │  └──────────────────────────────┘  │ │
         │  └──────────────────────────────────────┘ │
         │                                            │
         │  ┌──────────────────────────────────────┐ │
         │  │   VehicleManager (Generador)         │ │
         │  ├──────────────────────────────────────┤ │
         │  │                                      │ │
         │  │  🚗 Generación Aleatoria             │ │
         │  │     • 30% chance por frame            │ │
         │  │     • Todas las direcciones          │ │
         │  │                                      │ │
         │  │  🚗 Lógica de Movimiento             │ │
         │  │     • Respeta semáforo               │ │
         │  │     • Velocidad: 2px/frame           │ │
         │  │     • Se detiene en rojo             │ │
         │  │     • Avanza en verde                │ │
         │  │                                      │ │
         │  │  🚗 Limpieza                         │ │
         │  │     • Elimina cuando sale de pantalla│ │
         │  │                                      │ │
         │  └──────────────────────────────────────┘ │
         │                                            │
         │  ┌──────────────────────────────────────┐ │
         │  │  WebSocket Handler                   │ │
         │  │  • Broadcast de estado 60/s          │ │
         │  │  • Manejo de comandos del cliente    │ │
         │  │  • Broadcast de eventos              │ │
         │  └──────────────────────────────────────┘ │
         │                                            │
         └────────────────────────────────────────────┘
```

---

## Ciclo de Sincronización

```
┌──────────────────────────────────────────────────────────────┐
│              CICLO DE SIMULACIÓN (60 FPS)                     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  [0ms - 16.6ms FRAME]                                        │
│                                                                │
│  1. TrafficController.tick(Δt)                               │
│     ├─ Incrementar systemTime                                │
│     ├─ Verificar cambio de fase                              │
│     ├─ Actualizar estado de cada luz                         │
│     └─ Emitir eventos si hay cambio                          │
│                                                                │
│  2. VehicleManager.update(controller)                        │
│     ├─ Generar nuevos vehículos (30% chance)                 │
│     ├─ Para cada vehículo:                                   │
│     │  ├─ Obtener estado de su semáforo                      │
│     │  ├─ Actualizar posición si está verde                  │
│     │  └─ Remover si salió de pantalla                       │
│     └─ Retornar lista de vehículos actual                    │
│                                                                │
│  3. Broadcast a Clientes                                      │
│     ├─ State (luces, tiempo, ciclos)                         │
│     └─ Vehicles (posiciones actuales)                        │
│                                                                │
│  4. Cliente React                                             │
│     ├─ Recibir actualización vía WebSocket                   │
│     ├─ setState() con nueva información                      │
│     └─ Re-render de SVG (carros y semáforos)                │
│                                                                │
│  ⏱️  Tiempo total: ~16.6ms = 60 FPS                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Fases de Control (20 segundos por ciclo completo)

```
┌─────────────────────────────────────────────────────────────────┐
│                  CICLO COMPLETO (20 segundos)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FASE 0: N-S VERDE (8 segundos)        FASE 1: N-S AMARILLO (2s)
│  ┌──────────────────────────────────┐  ┌──────────────────────┐
│  │ ▲ NORTE                          │  │ ▲ NORTE              │
│  │ │ 🟢 GREEN                       │  │ │ 🟡 YELLOW          │
│  │ └ SUR   🟢 GREEN                 │  │ └ SUR  🟡 YELLOW     │
│  │ ◄ OESTE 🔴 RED                   │  │ ◄ OESTE 🔴 RED      │
│  │ ► ESTE  🔴 RED                   │  │ ► ESTE  🔴 RED      │
│  │                                   │  │                      │
│  │ 🚗🚗🚗 Carros circulan N-S        │  │ ⏳ Transición...    │
│  │ 🚗 Los de E-O esperan            │  │                      │
│  └──────────────────────────────────┘  └──────────────────────┘
│           ↓                                      ↓
│  FASE 2: E-O VERDE (8 segundos)        FASE 3: E-O AMARILLO (2s)
│  ┌──────────────────────────────────┐  ┌──────────────────────┐
│  │ ▲ NORTE 🔴 RED                   │  │ ▲ NORTE 🔴 RED      │
│  │ └ SUR   🔴 RED                   │  │ └ SUR   🔴 RED      │
│  │ ◄ OESTE 🟢 GREEN                 │  │ ◄ OESTE 🟡 YELLOW  │
│  │ ► ESTE  🟢 GREEN                 │  │ ► ESTE  🟡 YELLOW  │
│  │                                   │  │                      │
│  │ 🚗🚗🚗 Carros circulan E-O        │  │ ⏳ Transición...    │
│  │ 🚗 Los de N-S esperan            │  │ → Vuelve a Fase 0   │
│  └──────────────────────────────────┘  └──────────────────────┘
│
│  ✅ GARANTÍA: N-S y E-O NUNCA están en VERDE simultáneamente
│
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### 1. TrafficLight (Semáforo Individual)

```
┌────────────────────────────────┐
│        TrafficLight            │
├────────────────────────────────┤
│ • state: red/yellow/green      │
│ • direction: norte/sur/est/oes │
│ • elapsed: segundos            │
│ • listeners: callbacks          │
├────────────────────────────────┤
│ Métodos:                       │
│ • setState(newState)           │
│ • tick(deltaTime)              │
│ • getRemainingTime()           │
│ • subscribe(callback)          │
└────────────────────────────────┘
```

### 2. TrafficController (Orquestador Central)

```
┌─────────────────────────────────────────┐
│      TrafficController                   │
├─────────────────────────────────────────┤
│ • lights: {norte, sur, este, oeste}     │
│ • phaseConfig: array de 4 fases         │
│ • currentPhase: índice actual            │
│ • isRunning: boolean                     │
│ • systemTime: tiempo total               │
│ • cyclesCompleted: contador              │
├─────────────────────────────────────────┤
│ Métodos Públicos:                       │
│ • start() / pause() / reset()            │
│ • tick(deltaTime)                        │
│ • setCycleDuration(duration)             │
│ • getSystemState()                       │
│ • subscribe(callback)                    │
├─────────────────────────────────────────┤
│ Métodos Privados:                       │
│ • activatePhase(phaseIndex)              │
│ • emitEvent(type, data)                  │
└─────────────────────────────────────────┘
```

### 3. Vehicle (Carro Individual)

```
┌────────────────────────────────┐
│         Vehicle                │
├────────────────────────────────┤
│ • id: identificador único      │
│ • direction: dirección         │
│ • x, y: posición actual        │
│ • width, height: dimensiones   │
│ • speed: velocidad             │
│ • isWaiting: en espera         │
├────────────────────────────────┤
│ Métodos:                       │
│ • update(lightState)           │
│ • isOutOfBounds()              │
└────────────────────────────────┘
```

### 4. VehicleManager (Gestor de Vehículos)

```
┌──────────────────────────────────────┐
│      VehicleManager                  │
├──────────────────────────────────────┤
│ • vehicles: array de Vehicle         │
│ • vehicleId: contador                │
│ • spawnRate: probabilidad 30%        │
│ • roadsConfig: definición de carreteras
├──────────────────────────────────────┤
│ Métodos:                             │
│ • spawnVehicle(direction)            │
│ • update(controller, limits)         │
│ • getVehicles()                      │
└──────────────────────────────────────┘
```

---

## Flujo de Datos WebSocket

```
CLIENTE ──→ SERVIDOR          SERVIDOR ──→ CLIENTE
                               
┌──────────────┐              ┌──────────────┐
│{type: start} │─────────────→│ Procesa      │
│              │              │ comando      │
│              │              │              │
│{type: pause} │─────────────→│ Ejecuta      │
│              │              │ acción       │
│              │              │              │
│{type: reset} │─────────────→│ Reinicia     │
│              │              │ simulación   │
│              │              │              │
│{type: set...}│─────────────→│ Actualiza    │
│  Duration    │              │ parámetros   │
│              │              │              │
│              │    ╔═════════════════════╗  │
│              │    ║  MAIN LOOP 60 FPS   ║  │
│              │    ╚═════════════════════╝  │
│              │              │              │
│              │←─────────────│{type:update  │
│              │              │ state,       │
│ setState()   │              │ vehicles}    │
│ re-render    │              │              │
│              │←─────────────│{type:event   │
│ addEvent()   │              │ [new]}       │
│              │              │              │
│              │←─────────────│{type:init    │
│ Initial data │              │ (on connect)}│
└──────────────┘              └──────────────┘
```

---

## Sincronización de Semáforos (Garantía de NO Conflicto)

```
TIEMPO      NORTE        SUR          ESTE         OESTE
═══════════════════════════════════════════════════════════

0:00s       ROJO         ROJO         ROJO         ROJO
            (iniciando)  (iniciando)  (iniciando)  (iniciando)

0:01s       🟢 VERDE     🟢 VERDE     🔴 ROJO      🔴 ROJO
            ▼            ▼            ◄ ►          ◄ ►
            (carros)     (carros)     (esperan)    (esperan)

0:05s       🟢 VERDE     🟢 VERDE     🔴 ROJO      🔴 ROJO

0:08s       🟡 AMARILLO  🟡 AMARILLO  🔴 ROJO      🔴 ROJO
            (frenando)   (frenando)   (esperan)    (esperan)

0:10s       🔴 ROJO      🔴 ROJO      🟢 VERDE     🟢 VERDE
            (esperan)    (esperan)    ◄ ►          ◄ ►
                                      (carros)     (carros)

0:15s       🔴 ROJO      🔴 ROJO      🟢 VERDE     🟢 VERDE

0:18s       🔴 ROJO      🔴 ROJO      🟡 AMARILLO  🟡 AMARILLO
            (esperan)    (esperan)    (frenando)   (frenando)

0:20s       🟢 VERDE     🟢 VERDE     🔴 ROJO      🔴 ROJO
            (vuelta)     (vuelta)     (esperan)    (esperan)

═══════════════════════════════════════════════════════════
GARANTÍA ✅: NUNCA hay 🟢 simultáneamente en N-S Y E-O
```

---

**Este sistema implementa correctamente computación paralela**  
**con semáforos independientes coordinados centralmente.** 🎯
