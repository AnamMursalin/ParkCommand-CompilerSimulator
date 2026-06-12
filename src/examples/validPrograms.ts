export interface ExampleProgram {
  name: string;
  description: string;
  code: string;
  defaultSlots: number;
  defaultVehicle: string;
}

export const VALID_EXAMPLES: ExampleProgram[] = [
  {
    name: 'Full Mall Automation',
    description: 'The standard program demonstrating slots checks, gate control, slot reservations, repeat loops, and emergency priority override.',
    code: `parking MallZone begin
if slots > 20 then open gate
reserve slot VIP_A1
reserve slot STAFF_B2
repeat 2 times check sensor
if vehicle == VIP then open gate
emergency ambulance override gate
release slot VIP_A1
close gate
end`,
    defaultSlots: 25,
    defaultVehicle: 'VIP',
  },
  {
    name: 'Emergency Bypass Protocol',
    description: 'Shows that even if the gate is closed (e.g. because slots == 0), an approaching emergency vehicle override will force it open.',
    code: `parking HospitalZone begin
if slots == 0 then close gate
emergency police override gate
reserve slot STAFF_B1
end`,
    defaultSlots: 0,
    defaultVehicle: 'police',
  },
  {
    name: 'VIP Check & Reservation',
    description: 'Scans the entry sensor and opens the gate only if a VIP vehicle is detected, then books the VIP_A2 slot.',
    code: `parking AirportVIP begin
check sensor
if vehicle == VIP then open gate
reserve slot VIP_A2
end`,
    defaultSlots: 15,
    defaultVehicle: 'VIP',
  },
  {
    name: 'Repeat Sensor Polling',
    description: 'Performs multiple sensor checks to poll for approaching vehicles before letting visitors in.',
    code: `parking CityPlaza begin
repeat 3 times check sensor
if slots > 5 then open gate
reserve slot VISITOR_C1
end`,
    defaultSlots: 8,
    defaultVehicle: 'visitor',
  }
];
