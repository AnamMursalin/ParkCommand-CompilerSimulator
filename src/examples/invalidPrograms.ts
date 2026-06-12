import { ExampleProgram } from './validPrograms';

export const INVALID_EXAMPLES: ExampleProgram[] = [
  {
    name: 'Unknown Command Typo',
    description: 'Triggers a Lexical Error in the scanner. Misspells "open" as "opne", recommending the correct command using Levenshtein distance.',
    code: `parking MallZone begin
opne gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Missing Begin Clause',
    description: 'Triggers a Syntax Error. Omit the keyword "begin" after the parking zone identifier.',
    code: `parking MallZone
open gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Missing End Clause',
    description: 'Triggers a Syntax Error. Omit the closing keyword "end" at the bottom of the program block.',
    code: `parking MallZone begin
open gate`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Wrong Condition Syntax',
    description: 'Triggers a Syntax Error. Leaves out the number to compare against in the relational check.',
    code: `parking MallZone begin
if slots > then open gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Duplicate Slot Reservation',
    description: 'Triggers a Semantic Error. Attempts to reserve "VIP_A1" twice in a row without a release command in between.',
    code: `parking MallZone begin
reserve slot VIP_A1
reserve slot VIP_A1
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Release Unreserved Slot',
    description: 'Triggers a Semantic Error. Attempts to release slot "STAFF_B2" which was never previously reserved in this program.',
    code: `parking CityZone begin
release slot STAFF_B2
end`,
    defaultSlots: 15,
    defaultVehicle: 'staff',
  },
  {
    name: 'Invalid Emergency Vehicle',
    description: 'Triggers a Semantic Error. Uses "visitor" instead of "ambulance", "police", or "firetruck" in an emergency override statement.',
    code: `parking MallZone begin
emergency visitor override gate
end`,
    defaultSlots: 10,
    defaultVehicle: 'visitor',
  },
  {
    name: 'Negative Repeat Count',
    description: 'Triggers a Semantic Error. Uses zero (or negative count) in a sensor check repeat statement.',
    code: `parking AirportZone begin
repeat 0 times check sensor
end`,
    defaultSlots: 15,
    defaultVehicle: 'VIP',
  }
];
