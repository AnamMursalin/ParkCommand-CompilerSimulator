# ParkCommand Compiler Simulator - Comprehensive Project Report

---

## Official Project Details

### Project Title
**Design and Implementation of a Simple Compiler**

### Project Objective
The primary objective of this project is to design and implement a simple compiler for a custom or simplified programming language. The project aims to provide students with hands-on experience in the various stages of compiler construction, from lexical analysis to code generation and optimization.

### Project Scope
The project involves the following key components:

1. **Lexical Analysis**:
   - Design a lexical analyzer (lexer) to tokenize the input source code
   - Implement the lexer to recognize keywords, identifiers, operators, literals, and delimiters

2. **Syntax Analysis**:
   - Define the grammar of the target language using context-free grammar (CFG)
   - Implement a parser (any parser from bottom-up or top-down approaches) to check the syntactic structure of the source code

3. **Semantic Analysis**:
   - Implement semantic checks, such as type checking and scope resolution
   - Generate an abstract syntax tree (AST) or similar intermediate representation

4. **Intermediate Code Generation**:
   - Translate the high-level source code into intermediate code, such as three-address code or an abstract machine representation

5. **Code Optimization**:
   - Apply basic optimization techniques like constant folding, dead code elimination, and common subexpression elimination to improve the intermediate code

6. **Code Generation**:
   - Generate target code (e.g., assembly language or a virtual machine code) from the optimized intermediate code

7. **Testing and Debugging**:
   - Test the compiler with various programs to ensure it handles different language constructs correctly
   - Debug and refine the compiler to improve its robustness and performance

---

### Implementation Mapping to Project Scope
Below is how the ParkCommand Compiler Simulator fulfills each requirement from the official project scope:

| Scope Requirement # | Requirement | Implementation Status | Implementation Details |
|---------------------|-------------|-----------------------|-----------------------|
| 1 | Lexical Analysis | ✅ Fully Implemented | `lexer.ts` tokenizes keywords, identifiers, operators, numbers; includes spelling suggestions via Levenshtein distance |
| 2 | Syntax Analysis | ✅ Fully Implemented | Top‑down recursive descent parser in `parser.ts`; defines CFG grammar in formal spec; constructs full AST |
| 3 | Semantic Analysis | ✅ Fully Implemented | `semanticAnalyzer.ts` does type checking (valid vehicle types, emergency types), scope/slot state tracking via `symbolTable.ts`, and AST generation |
| 4 | Intermediate Code Generation | ✅ Fully Implemented | `intermediateCode.ts` generates three‑address‑style IR with labels, jumps, and virtual machine opcodes |
| 5 | Code Optimization | ✅ Fully Implemented | `optimizer.ts` does dead code elimination, unused label removal, peephole optimizations (like `repeat 0 times` removal) |
| 6 | Code Generation | ✅ Fully Implemented | Generates virtual machine code executed by `simulator.ts` (custom parking VM) |
| 7 | Testing & Debugging | ✅ Fully Implemented | Comprehensive test suite in `compiler.test.ts`, plus UI diagnostics, token/AST/symbol table views, simulation timeline |

---

## Table of Contents
1. [Official Project Details](#official-project-details)
2. [Implementation Mapping](#implementation-mapping-to-project-scope)
3. [Executive Summary](#executive-summary)
4. [Technical Report & Design Architecture](#technical-report--design-architecture)
5. [Formal Language Specification](#formal-language-specification)
6. [Compiler Documentation](#compiler-documentation)
7. [Test Cases & Results](#test-cases--results)
8. [Validation Findings](#validation-findings)

---

## Executive Summary
The **ParkCommand Compiler Simulator** is an educational compiler project that implements all 7 core phases of modern compiler design for a custom parking management language. The project features a modern React/TypeScript web interface with real‑time compilation, visualization of all compiler phases, and an animated parking simulator.

**All phases implemented**:
1. Lexical Analysis
2. Syntax Analysis
3. Semantic Analysis
4. Intermediate Code Generation
5. Code Optimization ✨ (NEW!)
6. Code Generation
7. Testing & Debugging

---

## Technical Report & Design Architecture

### Overall Architecture
The ParkCommand Compiler Simulator uses a modular, pipeline‑based architecture:
```
Source Code → Lexer → Parser → Semantic Analyzer → IR Generator → Optimizer → Simulator → UI
```

### Component Interdependencies
| Component | File | Dependencies | Purpose |
|-----------|------|--------------|---------|
| Lexer | `lexer.ts` | `errors.ts` | Tokenizes source code into token stream; provides spelling suggestions |
| Parser | `parser.ts` | `lexer.ts`, `ast.ts`, `errors.ts` | Top‑down recursive descent parser; constructs abstract syntax tree (AST) |
| Semantic Analyzer | `semanticAnalyzer.ts` | `ast.ts`, `symbolTable.ts`, `errors.ts` | Validates program logic; manages variable/slot state |
| IR Generator | `intermediateCode.ts` | `ast.ts` | Translates AST to three‑address‑style intermediate representation |
| Optimizer | `optimizer.ts` | `intermediateCode.ts` | Dead code elimination, unused label removal, peephole optimizations |
| Symbol Table | `symbolTable.ts` | None | Tracks parking zone, slot reservations, gate states |
| Simulator | `simulator.ts` | `intermediateCode.ts`, `ast.ts` | Executes optimized IR step‑by‑step with animated state |
| Compiler Pipeline | `compilerPipeline.ts` | All above | Orchestrates all 7 compiler phases |
| UI Components | `src/components/` | React, TypeScript, Tailwind CSS | Interactive interface for all features |

---

## Formal Language Specification

### 1. Formal Grammar (EBNF)
```ebnf
(* Program Structure *)
<program>        ::= "parking" <identifier> "begin" <statement_list> "end"
<statement_list> ::= <statement> | <statement> <statement_list>

(* Statements *)
<statement>      ::= <gate_command>
                   | <slot_command>
                   | <if_statement>
                   | <repeat_statement>
                   | <emergency_override>
                   | <sensor_check>

(* Gate Commands *)
<gate_command>   ::= "open" "gate"
                   | "close" "gate"

(* Slot Commands *)
<slot_command>   ::= "reserve" "slot" <slot_id>
                   | "release" "slot" <slot_id>
<slot_id>        ::= <identifier> | <number> | <vehicle_type>

(* If Statement *)
<if_statement>   ::= "if" <condition> "then" <statement>
<condition>      ::= "slots" <rel_op> <number>
                   | "vehicle" <rel_op> <vehicle_type>
<rel_op>         ::= ">" | "<" | ">=" | "<=" | "==" | "!="

(* Repeat Loop *)
<repeat_statement> ::= "repeat" <number> "times" <statement>

(* Emergency Override *)
<emergency_override> ::= "emergency" <emergency_type> "override" "gate"
<emergency_type>   ::= "ambulance" | "police" | "firetruck"

(* Sensor Check *)
<sensor_check>   ::= "check" "sensor"

(* Terminals *)
<identifier>     ::= [A-Za-z][A-Za-z0-9_]*
<number>         ::= [0-9]+
<vehicle_type>   ::= "VIP" | "staff" | "visitor" | "ambulance" | "police" | "firetruck"
```

### 2. Language Features & Syntax
| Feature | Syntax | Description |
|---------|--------|-------------|
| Program Declaration | `parking <ZoneName> begin <stmts> end` | Defines a new parking control program |
| Gate Control | `open gate`, `close gate` | Opens or closes the entrance barrier |
| Slot Management | `reserve slot <SlotID>`, `release slot <SlotID>` | Reserves/releases parking slots |
| Sensor Check | `check sensor` | Polls the entrance lane sensor |
| Conditional Logic | `if <condition> then <statement>` | Executes statement based on condition |
| Repeat Loops | `repeat <N> times <statement>` | Repeats a statement N times |
| Emergency Override | `emergency <type> override gate` | Forces gate open for emergency vehicles |

---

## Compiler Documentation

### Usage Instructions

#### 1. Compiling a Program
1. Enter ParkCommand code into the "ParkCommand IDE" text area
2. The compiler automatically runs in real‑time as you type
3. View compilation results in the "Compiler Pipeline Status" and "Compiler Metrics" panels
4. See detailed phase info in the "Tokens", "AST", "Symbol Table", "Intermediate Code", and "Diagnostics" tabs

#### 2. Executing the Simulation
1. Ensure the program compiled successfully (no errors)
2. Set simulation parameters using the "Live Parameters" controls:
   - Number of available slots
   - Approaching vehicle type
   - Auto‑close gate toggle
   - Emergency mode toggle
3. Press "Play Simulation" to start the animated execution
4. Watch the execution step‑by‑step in the "Simulation Timeline" and "Simulation Log"

#### 3. Debugging
- View compilation errors in the "Diagnostics" tab
- Use the phase breakdown to identify where errors occur
- Check token list in the "Tokens" tab for lexical issues
- Inspect AST structure in the "AST" tab for syntax errors
- Verify semantic state in the "Symbol Table" tab
- Test sample programs using the preset examples

---

## Test Cases & Results

### 1. Test Suite Summary
The test suite covers:
- **Unit tests**: Individual compiler phases (lexer, parser, semantic analyzer, optimizer)
- **Integration tests**: Full pipeline execution
- **End‑to‑end tests**: Complete compile‑and‑simulate scenarios

### 2. Complete Test Case List

| # | Test Name | Phase | Expected Outcome | Actual Outcome | Status |
|---|-----------|-------|------------------|----------------|--------|
| 1 | Spaceless Command Keyword `checksensor` | Lexer | Lexical error with spelling suggestion | ✅ Lexical error reported with suggestion | Passed |
| 2 | Spaceless If Condition `ifvehicle` | Lexer | Lexical error with spacing suggestion | ✅ Lexical error reported with suggestion | Passed |
| 3 | Unrecognized Character `$` | Lexer | Lexical error for illegal character | ✅ Lexical error reported | Passed |
| 4 | Valid Spaced Program | Parser | Successful compilation | ✅ All phases passed | Passed |
| 5 | Missing Begin Clause | Parser | Syntax error about missing `begin` | ✅ Correct syntax error reported | Passed |
| 6 | Missing End Clause | Parser | Syntax error about missing `end` | ✅ Correct syntax error reported | Passed |
| 7 | Negative Repeat Count | Semantic | Semantic error for count ≤ 0 | ✅ Correct semantic error reported | Passed |
| 8 | Duplicate Slot Reservations | Semantic | Semantic error for duplicate `reserve` | ✅ Correct semantic error reported | Passed |
| 9 | Releasing Unreserved Slot | Semantic | Semantic error for releasing unreserved slot | ✅ Correct semantic error reported | Passed |
| 10 | Invalid Emergency Override Category | Semantic | Semantic error for invalid emergency type | ✅ Correct semantic error reported | Passed |
| 11 | No‑op Optimization | Optimizer | IR unchanged when no optimizations possible | ✅ IR preserved, correct stats returned | Passed |
| 12 | Optimization Statistics | Optimizer | Valid statistics returned (counts, reduction %) | ✅ All statistics computed correctly | Passed |

### 3. Sample Test Programs

#### Valid Program 1: Basic Mall Parking
```
parking MallZone begin
if slots > 20 then open gate
reserve slot VIP_A1
reserve slot STAFF_B2
close gate
end
```
**Expected Result**: Compiles successfully; reserves 2 slots when > 20 available.  
**Actual Result**: ✅ Passed

#### Invalid Program 1: Unknown Command Typo
```
parking MallZone begin
opne gate
end
```
**Expected Result**: Lexical error, spelling suggestion to `open`.  
**Actual Result**: ✅ Passed

---

## Validation Findings

### Screenshot Validation
A screenshot of the "Real‑Time Parking Simulation" UI was reviewed. Key observations:
- ✅ **Gate Status Display**: Shows "CLOSED" correctly in pink badge
- ✅ **Occupancy Display**: "4 / 6 FREE" is accurate
- ✅ **Slot Visualization**: 6 slots visible, with "VIP A1" and "Staff B2" marked "OCCUPIED"
- ✅ **UI Components**: All elements visible (gate, sensor, road, slots)
- ✅ **Color Scheme**: Uses red for occupied, green for free, neutral colors for road/sensor (matches the project's updated design system)

**No discrepancies found**. The observed output matches expected behavior as defined by the language and simulator specifications.
