# 🚦 Simulador de Cruce de Calles Inteligente

**Tarea 2: Sistema con Computación Paralela**  
**Autor:** Steven Umaña Lopez

---

## 📋 Especificaciones Implementadas

✅ **Cruce de calles con dos semáforos** - Controladores independientes pero sincronizados  
✅ **Nunca en verde al mismo tiempo** - Direcciones opuestas nunca se solapan  
✅ **Ciclos de tiempo configurables** - Ajusta duración desde 2 a 10 segundos  
✅ **4 semáforos funcionando de forma independiente** - Con coordinación central  
✅ **Controlador central asincrónico** - Cambios mediante eventos  
✅ **Visualización dinámica en React** - Actualización en tiempo real  
✅ **Computación paralela** - Semáforos simulados independientemente  
✅ **Carros circulando coherentemente** - Renderizados como rectángulos SVG (NO emojis)  

---

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express + WebSocket)

**TrafficController.js**
- `TrafficLight`: Semáforo individual con estado (rojo/amarillo/verde)
- `TrafficController`: Controlador central que coordina los 4 semáforos
  - Maneja 4 fases de sincronización
  - Asegura que N-S y E-O nunca estén en verde simultáneamente
  - Emite eventos para cambios de estado
  - Soporta pause/resume

**VehicleManager.js**
- `Vehicle`: Representa un carro en una carretera
  - Respeta el estado del semáforo de su dirección
  - Se mueve coherentemente cuando hay paso libre
  - Se detiene en la intersección si está rojo
- `VehicleManager`: Genera y gestiona vehículos dinámicamente

**index.js** (Servidor Principal)
- Servidor Express en puerto 3001
- WebSocket para comunicación real-time
- Bucle de simulación a 60 FPS
- Broadcast de estado a todos los clientes

### Frontend (React)

**TrafficSimulation.jsx**
- Componente principal con conexión WebSocket
- Panel de controles (Iniciar, Pausar, Reiniciar)
- Slider para ajustar duración del ciclo
- Visualización en SVG de la intersección
- Panel de eventos con log en tiempo real
- Indicadores de estado (tiempo, ciclos, fase actual)

**Estilo: TrafficSimulation.css**
- Diseño responsive (3 columnas en desktop, 1 en móvil)
- Panel de control con botones interactivos
- Visualización de semáforos y carros en SVG
- Panel de eventos con scroll automático

---

## 📦 Instalación

### Requisitos Previos
- Node.js 14+ 
- npm o yarn
- Git

### Pasos de Instalación

```bash
# Clonar o entrar al repositorio
cd agents-mejoras-especificaciones-carros

# Instalar dependencias
npm install

# Inicializar estructura de carpetas (opcional, si tienes bash)
bash init.sh
```

---

## ▶️ Ejecución

### Modo Desarrollo (Servidor + Cliente)

```bash
npm run dev
```

Esto inicia:
- Frontend React en `http://localhost:3000`
- Backend en `http://localhost:3001`

### Solo Backend

```bash
npm start
```

### Solo Frontend

```bash
npm run client
```

---

## 🎮 Cómo Usar

1. **Abre la aplicación** en `http://localhost:3000`
2. **Haz clic en "Iniciar"** para empezar la simulación
3. **Observa los carros** circulando según el estado de los semáforos
4. **Ajusta el ciclo** con el slider de duración
5. **Pausa/Reanuda** con los botones de control
6. **Monitorea eventos** en el panel derecho

### Controles

| Control | Función |
|---------|---------|
| ▶ Iniciar | Comienza la simulación |
| ⏸ Pausar | Pausa la simulación |
| 🔄 Reiniciar | Reinicia todo desde cero |
| Slider | Ajusta duración del ciclo (2-10 seg) |

---

## 🔍 Características Principales

### Fase de Control

El sistema funciona en 4 fases sincronizadas:

```
Fase 0: N-S VERDE (8 seg)  →  E-O ROJO
Fase 1: N-S AMARILLO (2 seg) →  E-O ROJO  
Fase 2: N-S ROJO          →  E-O VERDE (8 seg)
Fase 3: N-S ROJO          →  E-O AMARILLO (2 seg)
```

### Renderización de Carros

Los vehículos se representan como **rectángulos rojo oscuro con ventanas azul cielo**:
- No son emojis (mejor visibilidad)
- Se mueven fluidamente en sus carriles
- Respetan las luces del semáforo
- Se generan aleatoriamente
- Se eliminan cuando salen de pantalla

### Eventos en Tiempo Real

El sistema emite eventos como:
- `Sistema iniciado`
- `Transición a [fase]`
- `Ciclo completado`
- `Sistema pausado`

---

## 📊 Estructura de Carpetas

```
agents-mejoras-especificaciones-carros/
├── package.json              # Dependencias
├── index.js                  # Servidor Express
├── TrafficController.js       # Lógica de semáforos
├── VehicleManager.js         # Gestión de carros
├── App.js                    # Componente React principal
├── App.css                   # Estilos globales
├── TrafficSimulation.js      # Componente de simulación
├── TrafficSimulation.css     # Estilos de simulación
├── index.jsx                 # Punto de entrada React
├── index.css                 # Estilos base
├── index.html                # HTML principal
├── init.sh                   # Script de inicialización
└── README.md                 # Este archivo
```

---

## 🔌 API WebSocket

### Mensajes del Cliente

```json
{ "type": "start" }
{ "type": "pause" }
{ "type": "reset" }
{ "type": "setCycleDuration", "duration": 5 }
```

### Mensajes del Servidor

```json
{ "type": "init", "state": {...}, "vehicles": [...] }
{ "type": "state", "state": {...} }
{ "type": "update", "state": {...}, "vehicles": [...] }
{ "type": "event", "event": {...} }
```

---

## 💡 Notas Técnicas

### Computación Paralela
- Cada semáforo es independiente pero coordinado centralmente
- El `TrafficController` actúa como orquestador
- Los vehículos se actualizan independientemente cada frame
- WebSocket maneja comunicación asincrónica

### Performance
- Simulación a 60 FPS (16.6ms por frame)
- Renderizado SVG eficiente
- WebSocket para actualizaciones en tiempo real
- Sin re-renders innecesarios en React

### Escalabilidad
- Fácil agregar más semáforos
- Sistema de eventos desacoplado
- Arquitectura cliente-servidor separada

---

## 🎨 Propuesta Visual

Implementa la estructura visual de tu imagen 2:
- ✅ Panel de controles a la izquierda
- ✅ Visualización de cruce en el centro
- ✅ Panel de eventos a la derecha
- ✅ Carros como rectángulos (no emojis)
- ✅ Semáforos coloridos en las 4 direcciones
- ✅ Información de fase y ciclos

---

## 📝 Licencia

Tarea Académica - Sistemas Operativos  
Computación Paralela 2026

---

## 🚀 Mejoras Futuras

- [ ] Agregar peatones y cruces
- [ ] Sistema de prioridad (ambulancias, bomberos)
- [ ] Estadísticas de flujo vehicular
- [ ] Modos de semáforo (adaptivo, fijo, manual)
- [ ] Guardar/cargar configuraciones
- [ ] Visualización 3D con Three.js

---

**Preguntas o problemas?** Revisa el código, está bien comentado!
