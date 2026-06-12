import { ExampleProgram } from './validPrograms';

export const INVALID_EXAMPLES: ExampleProgram[] = [
  {
    name: 'Missing Begin Clause',
    description: 'Fails during syntax analysis because the keyword "begin" is missing after the parking zone identifier.',
    code: `parking MallZone
open gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Duplicate Slot Reservation',
    description: 'Fails during semantic analysis because slot "VIP_A1" is reserved twice without being released in between.',
    code: `parking MallZone begin
reserve slot VIP_A1
reserve slot VIP_A1
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Invalid Emergency Vehicle',
    description: 'Fails during semantic analysis because "visitor" is used in an emergency override statement.',
    code: `parking MallZone begin
emergency visitor override gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Malformed IF Condition',
    description: 'Fails during syntax analysis because the comparison value is omitted after the operator ">".',
    code: `parking MallZone begin
if slots > then open gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Release Before Reserve',
    description: 'Fails during semantic analysis because "STAFF_B2" is released but was never previously booked.',
    code: `parking CityZone begin
release slot STAFF_B2
end`,
    defaultSlots: 15,
    defaultVehicle: 'staff',
  },
  {
    name: 'Zero Loop Count',
    description: 'Fails during semantic analysis because loop repeat count must be strictly positive (> 0).',
    code: `parking AirportZone begin
repeat 0 times check sensor
end`,
    defaultSlots: 15,
    defaultVehicle: 'VIP',
  }
];
