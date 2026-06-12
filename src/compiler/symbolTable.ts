export interface SymbolRow {
  name: string;
  type: 'Zone' | 'Slot' | 'Gate' | 'Sensor' | 'Emergency' | 'Vehicle';
  value: string;
  line: number;
}

export class SymbolTable {
  rows: SymbolRow[] = [];
  reservedSlots = new Set<string>();
  gateStatus: 'open' | 'close' = 'close';
  sensorCheckCount = 0;
  zoneName = '';
  emergencyOverrides: string[] = [];
  vehicleTypesChecked = new Set<string>();

  clear() {
    this.rows = [];
    this.reservedSlots.clear();
    this.gateStatus = 'close';
    this.sensorCheckCount = 0;
    this.zoneName = '';
    this.emergencyOverrides = [];
    this.vehicleTypesChecked.clear();
  }

  setZone(name: string, line: number) {
    this.zoneName = name;
    this.rows.push({ name, type: 'Zone', value: 'Active', line });
  }

  reserveSlot(slotId: string, line: number) {
    this.reservedSlots.add(slotId);
    this.rows.push({ name: slotId, type: 'Slot', value: 'Reserved', line });
  }

  releaseSlot(slotId: string, line: number) {
    this.reservedSlots.delete(slotId);
    this.rows.push({ name: slotId, type: 'Slot', value: 'Released', line });
  }

  setGate(status: 'open' | 'close', line: number) {
    this.gateStatus = status;
    this.rows.push({ name: 'gateStatus', type: 'Gate', value: status.toUpperCase(), line });
  }

  addSensorCheck(count: number, line: number) {
    this.sensorCheckCount += count;
    this.rows.push({
      name: 'sensorCheckCount',
      type: 'Sensor',
      value: `${this.sensorCheckCount} times`,
      line,
    });
  }

  addVehicleCheck(type: string, line: number) {
    this.vehicleTypesChecked.add(type);
    this.rows.push({
      name: `vehicle_check_${type}`,
      type: 'Vehicle',
      value: `Validated in conditional`,
      line,
    });
  }

  addEmergencyOverride(type: string, line: number) {
    this.emergencyOverrides.push(type);
    this.rows.push({
      name: 'emergencyOverride',
      type: 'Emergency',
      value: `Bypassed by ${type}`,
      line,
    });
  }
}
