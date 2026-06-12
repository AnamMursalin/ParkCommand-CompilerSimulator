# ParkCommand: Smart Parking Control Language

**ParkCommand** is a complete, browser-based compiler simulator designed for a domain-specific smart parking control language. It simulates a compiler pipeline (Lexer, Parser, Semantic Analyzer, Symbol Table, and Intermediate Code Generator) and runs a step-by-step visual parking arena simulation in real time. 

The application is built using **React, TypeScript, Vite, and Tailwind CSS**, running entirely in the client with no backend dependencies.

---

## 1. Language Grammar (Context-Free Grammar)

ParkCommand programs govern parking barriers, slots booking, entry sensors, and emergency bypass events. The grammar is defined as follows:

```
Program       → parking id begin StmtList end

StmtList      → Stmt StmtList | Stmt

Stmt          → GateCmd
              | SlotCmd
              | IfStmt
              | RepeatStmt
              | EmergencyStmt
              | SensorCmd

GateCmd       → open gate
              | close gate

SlotCmd       → reserve slot id
              | release slot id

IfStmt        → if Condition then Stmt

Condition     → slots RelOp number
              | vehicle RelOp VehicleType

RelOp         → > | < | >= | <= | == | !=

RepeatStmt    → repeat number times Stmt

SensorCmd     → check sensor

EmergencyStmt → emergency EmergencyType override gate

EmergencyType → ambulance | police | firetruck

VehicleType   → VIP | staff | visitor | ambulance | police | firetruck
```

---

## 2. Compiler Pipeline & Phases

### Phase 1: Lexical Analyzer (`lexer.ts`)
The Lexer scans the source code character-by-character and transforms it into a structured stream of tokens.
- **Tokens Recognized**:
  - `KEYWORD`: `parking`, `begin`, `end`, `if`, `then`, `repeat`, `times`, `emergency`, `override`
  - `COMMAND`: `open`, `close`, `reserve`, `release`, `check`
  - `OBJECT`: `gate`, `slot`, `sensor`
  - `TYPE`: `VIP`, `staff`, `visitor`, `ambulance`, `police`, `firetruck`
  - `IDENTIFIER`: Arbitrary alphanumeric labels representing zone names or slot names (e.g. `MallZone`, `VIP_A1`).
  - `NUMBER`: Digits (e.g. `20`, `2`).
  - `RELOP`: Operators (`>`, `<`, `>=`, `<=`, `==`, `!=`).
- **Error Detection**: Illegal characters (e.g. `$` or `@`) are flagged with precise line and column offsets.

### Phase 2: Parser / Syntax Analyzer (`parser.ts`)
A recursive-descent parser validates that the token stream conforms to the Context-Free Grammar.
- **AST Node Output**: Generates an Abstract Syntax Tree (AST) tree containing node structures like `Program`, `GateCommand`, `SlotCommand`, `IfStatement`, `Condition`, `RepeatStatement`, and `EmergencyOverride`.
- **Error Recovery**: If a syntax error is detected, the parser records the error, synchronizes to the next statement boundaries (e.g. searching for keywords like `end`, `open`, `reserve`), and continues scanning to identify all syntax issues in one run.

### Phase 3: Semantic Analyzer (`semanticAnalyzer.ts`)
The Semantic Analyzer inspects the AST to ensure the code obeys physical parking rules and priority states.
- **Semantic Validation Rules**:
  - **Duplicate Reservations**: A slot cannot be reserved twice without an intermediate release (e.g. `reserve slot VIP_A1` followed by another `reserve slot VIP_A1`).
  - **Premature Releases**: A slot cannot be released if it is not currently reserved.
  - **Negative/Zero Repeats**: Repeat loop counts must be strictly positive (`> 0`).
  - **Invalid Emergency Vehicles**: Bypasses can only be triggered by `ambulance`, `police`, or `firetruck`. Other vehicle types (like `visitor`) trigger a semantic override restriction error.
  - **Vehicle Categories**: Validates that condition checks only refer to valid categories (`VIP`, `staff`, `visitor`, etc.).

### Phase 4: Symbol Table (`symbolTable.ts`)
The Symbol Table tracks the static and dynamic state of elements in the compiled scope:
- Active zone name.
- Currently booked slots.
- Gate positioning state (`OPEN`/`CLOSED`).
- Aggregate entry sensor check counts.
- Log of vehicle checks and overrides.

### Phase 5: Intermediate Code Generator (`intermediateCode.ts`)
Translates the verified AST into a simplified, flat assembly-like **Three-Address Code (3AC) Intermediate Representation (IR)**.
- Compiles conditional statements (`if`) into GOTO branches with incrementing labels (`L1:`, `L2:`, etc.).
- Compiles loops into single instruction registers.
- Example:
  ```assembly
  ZONE MallZone
  IF slots > 20 GOTO L1
  GOTO L2
  L1: GATE_OPEN
  L2:
  END_ZONE
  ```

---

## 3. Simulation Engine & Visualization (`simulator.ts`)

Once code compiles successfully, the simulator parses the AST against the **Live Dashboard Parameters**:
1. **Available Slots slider**: Represents the real-time slot occupancy level.
2. **Approaching Vehicle dropdown**: Selects the type of car sitting on the entry road.

### Visual Animation Behaviors:
- **Gate Barrier**: A striped gate arm rotates smoothly upward (`-75deg`) or flat (`0deg`) using CSS transitions.
- **Pulsing Sensor**: The scanner ring blinks and pulses cyan when a `check sensor` instruction runs.
- **Vehicles**: Custom vehicle cards slide dynamically towards the gate, flashing emergency sirens for `ambulance`, `police`, or `firetruck`. If the gate is open, they drive through and fade away.
- **Slots Grid**: A graphical representation of 6 parking slots (`VIP_A1`, `VIP_A2`, `STAFF_B1`, `STAFF_B2`, `VISITOR_C1`, `VISITOR_C2`) showing car silhouettes and red highlight indicators when reserved.
- **Emergency overrides**: Sirens blink and a red alert banner announces priority bypasses.

---

## 4. Sample Code Presets

### Valid Automation Script:
```parking
parking MallZone begin
if slots > 20 then open gate
reserve slot VIP_A1
reserve slot STAFF_B2
repeat 2 times check sensor
if vehicle == VIP then open gate
emergency ambulance override gate
release slot VIP_A1
close gate
end
```

### Invalid Error Cases:
- **Missing Block Begin**:
  ```parking
  parking MallZone
  open gate
  end
  ```
  *Error output: Syntax Error at line 1, column 18: Expected 'begin' after parking zone name.*

- **Duplicate Slot booking**:
  ```parking
  parking PlazaZone begin
  reserve slot STAFF_B2
  reserve slot STAFF_B2
  end
  ```
  *Error output: Semantic Error at line 3: Slot STAFF_B2 is already reserved.*

---

## 5. Development & Startup Commands

Follow these steps to run the compiler simulator locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```

### 3. Compile for Production
```bash
npm run build
```
The compiled static assets will be outputted to the `dist/` directory, ready to be hosted on Netlify, GitHub Pages, or any static provider.
