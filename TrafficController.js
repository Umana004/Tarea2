/**
 * Controlador central de semáforos
 */
class TrafficLight {
  constructor(id, direction) {
    this.id = id;
    this.direction = direction;
    this.state = 'red';
    this.duration = { red: 5, yellow: 2, green: 5 };
    this.elapsed = 0;
    this.listeners = [];
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.elapsed = 0;
      this.notifyListeners();
    }
  }

  getState() {
    return this.state;
  }

  getRemainingTime() {
    return Math.max(0, this.duration[this.state] - this.elapsed);
  }

  tick(deltaTime = 1) {
    this.elapsed += deltaTime;
    return this.getRemainingTime();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }
}

class TrafficController {
  constructor(cycleDuration = 20) {
    this.cycleDuration = cycleDuration;
    this.lights = {
      norte: new TrafficLight('norte', 'N'),
      sur: new TrafficLight('sur', 'S'),
      este: new TrafficLight('este', 'E'),
      oeste: new TrafficLight('oeste', 'O')
    };

    this.phaseConfig = [
      { lights: ['norte', 'sur'], state: 'green', duration: 8 },
      { lights: ['norte', 'sur'], state: 'yellow', duration: 2 },
      { lights: ['este', 'oeste'], state: 'green', duration: 8 },
      { lights: ['este', 'oeste'], state: 'yellow', duration: 2 }
    ];

    this.currentPhase = 0;
    this.phaseElapsed = 0;
    this.systemTime = 0;
    this.isRunning = false;
    this.listeners = [];
    this.cyclesCompleted = 0;

    this.initializeLights();
  }

  initializeLights() {
    Object.values(this.lights).forEach(light => light.setState('red'));
    this.activatePhase(0);
  }

  activatePhase(phaseIndex) {
    const phase = this.phaseConfig[phaseIndex];
    
    Object.keys(this.lights).forEach(direction => {
      if (!phase.lights.includes(direction)) {
        this.lights[direction].setState('red');
      }
    });

    phase.lights.forEach(direction => {
      this.lights[direction].setState(phase.state);
    });

    this.currentPhase = phaseIndex;
    this.phaseElapsed = 0;
  }

  tick(deltaTime = 1) {
    if (!this.isRunning) return;

    this.systemTime += deltaTime;
    this.phaseElapsed += deltaTime;

    Object.values(this.lights).forEach(light => light.tick(deltaTime));

    const currentPhaseConfig = this.phaseConfig[this.currentPhase];
    if (this.phaseElapsed >= currentPhaseConfig.duration) {
      const nextPhase = (this.currentPhase + 1) % this.phaseConfig.length;
      
      if (nextPhase === 0) {
        this.cyclesCompleted++;
        this.emitEvent('cycle_completed', { cycles: this.cyclesCompleted });
      }
      
      this.activatePhase(nextPhase);
      this.emitEvent('phase_changed', {
        phase: this.currentPhase,
        timestamp: this.systemTime
      });
    }

    this.emitEvent('tick', { systemTime: this.systemTime });
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.systemTime = 0;
      this.cyclesCompleted = 0;
      this.emitEvent('system_started', { timestamp: this.systemTime });
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      this.emitEvent('system_paused', { timestamp: this.systemTime });
    }
  }

  reset() {
    this.isRunning = false;
    this.systemTime = 0;
    this.phaseElapsed = 0;
    this.currentPhase = 0;
    this.cyclesCompleted = 0;
    this.initializeLights();
    this.emitEvent('system_reset', { timestamp: 0 });
  }

  setCycleDuration(duration) {
    this.cycleDuration = duration;
    const totalDuration = this.phaseConfig.reduce((sum, p) => sum + p.duration, 0);
    const ratio = duration / totalDuration;
    this.phaseConfig.forEach(phase => {
      phase.duration = Math.round(phase.duration * ratio);
    });
  }

  getLightState(direction) {
    return this.lights[direction]?.getState() || 'red';
  }

  getSystemState() {
    const state = {};
    Object.keys(this.lights).forEach(direction => {
      state[direction] = {
        state: this.lights[direction].getState(),
        remaining: this.lights[direction].getRemainingTime()
      };
    });
    return {
      lights: state,
      isRunning: this.isRunning,
      systemTime: this.systemTime,
      currentPhase: this.currentPhase,
      cyclesCompleted: this.cyclesCompleted
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  emitEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: this.systemTime,
      data
    };
    this.listeners.forEach(cb => cb(event));
  }
}

module.exports = { TrafficLight, TrafficController };
