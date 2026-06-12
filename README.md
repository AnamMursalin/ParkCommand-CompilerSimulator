# ParkCommand: Smart Parking Compiler & Simulator

**ParkCommand** is a complete compiler construction simulator that compiles a custom domain-specific language for automated parking gates and lot systems. It simulates a 4-phase compiler pipeline and executes visual simulation animations driven directly by the compiled abstract syntax tree.

---

## 1. Domain-Specific Grammar (Context-Free Grammar)

ParkCommand programs run according to this strict grammar syntax:

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

## 2. Compiler Pipeline Upgrades

### A. Context-Aware Lexer (`lexer.ts`)
- **Dictionary Check**: Only registers arbitrary keywords and types defined in the grammar.
- **Context-Aware Identifiers**: Words like `MallZone` or `VIP_A1` are ONLY tokenized as valid `IDENTIFIER`s if they immediately follow declaration keywords (`parking` or `slot`).
- **Typo Spelling Recommendations**: Any invalid word elsewhere triggers a Lexical Error. It calculates **Levenshtein Distance** against all valid words to suggest corrections (e.g., typing `opne` suggests `Did you mean 'open'?`).

### B. Recursive Parser (`parser.ts`)
- **Syntax Analysis**: Translates token lists into an Abstract Syntax Tree (AST).
- **Incomplete Operators**: Catch comparative checks omitting values, raising `Syntax Error: Expected number after relational operator.`
- **Sync Point Recovery**: If an instruction fails parsing, it synchronization-skips to subsequent statement blocks (`end`, `open`, `reserve`, etc.) to gather all code syntax warnings in a single compile.

### C. Semantic Analyzer (`semanticAnalyzer.ts`)
- **Symbol Records**: Builds a symbol table registering gate states, loops, sensor scans, and slots.
- **Double-booking safety**: Flags compile errors if slot addresses are reserved twice, or released prior to reservation.
- **Bypass Priority**: Implements safety bypass checks. If a program attempts to close a gate due to lack of space (`slots == 0`) but receives an `emergency` command, it notes the override priority: `"Emergency override has higher priority, so [vehicle] can open the gate even when parking is full."`

### D. Intermediate Code Generator (`intermediateCode.ts`)
- Flattens the AST into 3-Address GOTO branches with sequentially incrementing labels.
- Formats loop structures using `REPEAT_START [N]` and `REPEAT_END` tags.

---

## 3. Top-Down Visual Arena & Timeline

### Visual Elements:
- **Top-Down Graphics**: Renders a styled asphalt entrance and exit road, complete with lane markings.
- **Striped Gate Barriers**: Gate barrier pivot arms rotate upwards smoothly via CSS transitions.
- **Traffic Light Indicators**: Auto-glows red when closed, green when open.
- **Sensors Radar Waves**: The center sensor tower emits concentric ripple ring animations when polled.
- **Top-Down Vehicles**: Cars are rendered as vector chassis (Red Sirens for Ambulances, Navy Blue decals for Police patrols, Royal Purple frames with gold rims for VIPs, and silver visitor cars).
- **Evaluation Popup Cards**: Displays condition comparison diagnostics in real-time above the gate.

### Interactive Timelines:
- Displays chronological step nodes horizontally below the canvas.
- Automatically slides and glows-highlights the current execution node.
- Highlights the corresponding line of source code in the IDE editor in sync.

---

## 4. Run & Build Commands

### Setup Node Modules:
```bash
npm install
```

### Dev Server:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```
The compiled bundle will output to the local `dist/` folder.
