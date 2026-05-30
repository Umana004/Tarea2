/**
 * Vehicle - Simula vehículos en las carreteras
 */
class Vehicle {
  constructor(id, direction, startPos) {
    this.id = id;
    this.direction = direction; // 'norte', 'sur', 'este', 'oeste'
    this.x = startPos.x;
    this.y = startPos.y;
    this.speed = 2; // píxeles por frame
    this.width = 30;
    this.height = 15;
    this.isWaiting = false;
    this.hasPassedIntersection = false;
  }

  update(trafficLightState, intersectionLimits) {
    const { minX, maxX, minY, maxY } = intersectionLimits;

    // Determinar si el vehículo está en la zona de intersección
    const isInIntersection = 
      this.x + this.width > minX && this.x < maxX &&
      this.y + this.height > minY && this.y < maxY;

    // Actualizar estado de espera basado en la luz del semáforo
    if (isInIntersection && trafficLightState === 'red') {
      this.isWaiting = true;
    } else if (!isInIntersection || trafficLightState === 'green') {
      this.isWaiting = false;
    }

    // Mover vehículo si no está esperando
    if (!this.isWaiting) {
      switch (this.direction) {
        case 'norte':
          this.y -= this.speed;
          break;
        case 'sur':
          this.y += this.speed;
          break;
        case 'este':
          this.x += this.speed;
          break;
        case 'oeste':
          this.x -= this.speed;
          break;
      }
    }
  }

  isOutOfBounds(roadLimits) {
    const { minX, maxX, minY, maxY } = roadLimits;
    return this.x > maxX || this.x < minX || this.y > maxY || this.y < minY;
  }
}

/**
 * VehicleManager - Gestiona la creación y actualización de vehículos
 */
class VehicleManager {
  constructor() {
    this.vehicles = [];
    this.vehicleId = 0;
    this.spawnRate = 0.3; // Probabilidad de crear un vehículo por frame
    this.roadsConfig = {
      norte: { minX: 220, maxX: 260, minY: -50, maxY: 100, spawn: { x: 240, y: -30 } },
      sur: { minX: 220, maxX: 260, minY: 300, maxY: 450, spawn: { x: 240, y: 420 } },
      este: { minX: 300, maxX: 450, minY: 190, maxY: 230, spawn: { x: 420, y: 210 } },
      oeste: { minX: -50, maxX: 100, minY: 190, maxY: 230, spawn: { x: -30, y: 210 } }
    };
  }

  spawnVehicle(direction) {
    const config = this.roadsConfig[direction];
    if (config) {
      const vehicle = new Vehicle(
        `v${this.vehicleId++}`,
        direction,
        config.spawn
      );
      this.vehicles.push(vehicle);
      return vehicle;
    }
  }

  update(trafficController, intersectionLimits) {
    // Generar nuevos vehículos aleatoriamente
    const directions = ['norte', 'sur', 'este', 'oeste'];
    directions.forEach(dir => {
      if (Math.random() < this.spawnRate) {
        this.spawnVehicle(dir);
      }
    });

    // Actualizar vehículos existentes
    this.vehicles.forEach((vehicle, index) => {
      const lightState = trafficController.getLightState(vehicle.direction);
      vehicle.update(lightState, intersectionLimits);

      // Remover vehículos que salen de la pantalla
      if (vehicle.isOutOfBounds(this.roadsConfig[vehicle.direction])) {
        this.vehicles.splice(index, 1);
      }
    });
  }

  getVehicles() {
    return this.vehicles;
  }
}

module.exports = { Vehicle, VehicleManager };
