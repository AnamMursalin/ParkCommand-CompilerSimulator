export interface ExampleProgram {
  name: string;
  description: string;
  code: string;
  defaultSlots: number;
  defaultVehicle: string;
}

export const VALID_EXAMPLES: ExampleProgram[] = [
  {
    name: 'Basic Mall Parking',
    description: 'A standard mall gate automation program. Checks if available slots are greater than 20, and manages entry bookings.',
    code: `parking MallZone begin
if slots > 20 then open gate
reserve slot VIP_A1
reserve slot STAFF_B2
close gate
end`,
    defaultSlots: 25,
    defaultVehicle: 'visitor',
  },
  {
    name: 'VIP Parking Protocol',
    description: 'Scans approaching vehicles; opens the barrier and books a dedicated slot only if a VIP vehicle is detected.',
    code: `parking AirportVIP begin
check sensor
if vehicle == VIP then open gate
reserve slot VIP_A1
end`,
    defaultSlots: 15,
    defaultVehicle: 'VIP',
  },
  {
    name: 'Emergency Override',
    description: 'Forces the gate open and overrides normal constraints when an ambulance arrives, flashing emergency beacons.',
    code: `parking HospitalGate begin
if slots == 0 then close gate
emergency ambulance override gate
reserve slot STAFF_B1
end`,
    defaultSlots: 0,
    defaultVehicle: 'ambulance',
  },
  {
    name: 'Full Parking Zone Simulation',
    description: 'Comprehensive program exercising gate checks, loop repeats, vehicle scans, slot allocations, and emergency overrides.',
    code: `parking PlazaZone begin
if slots > 20 then open gate
reserve slot VIP_A1
reserve slot STAFF_B2
repeat 2 times check sensor
if vehicle == VIP then open gate
emergency ambulance override gate
release slot VIP_A1
close gate
end`,
    defaultSlots: 24,
    defaultVehicle: 'VIP',
  },
  {
    name: 'Sensor Repeat Example',
    description: 'Illustrates repeat-loop sensor polling to scan the lane multiple times before executing conditional entries.',
    code: `parking CityZone begin
repeat 3 times check sensor
if slots > 5 then open gate
reserve slot VISITOR_C1
end`,
    defaultSlots: 12,
    defaultVehicle: 'visitor',
  }
];
