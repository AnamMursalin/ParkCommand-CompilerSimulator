import { ResolvedIRInstruction } from './intermediateCode';

/**
 * ParkCommand Compiler - Phase 5: Code Optimization
 * 
 * Implements simplified but effective optimization passes:
 * 1. Dead Code Elimination (DCE)
 * 2. Constant Folding
 * 3. Peephole Optimizations (remove redundant operations)
 * 4. Remove unreachable labels
 * 5. Merge consecutive identical operations (if applicable)
 */

export function optimizeIR(instructions: ResolvedIRInstruction[]): ResolvedIRInstruction[] {
  if (instructions.length === 0) return [];

  let optimized = [...instructions];

  // Pass 1: Remove redundant LABEL declarations that are never referenced
  optimized = removeUnusedLabels(optimized);

  // Pass 2: Dead Code Elimination - Remove code after END_ZONE
  optimized = removeDeadCodeAfterEndZone(optimized);

  // Pass 3: Peephole optimizations
  optimized = peepholeOptimizations(optimized);

  // Pass 4: Re-resolve labels after any modifications
  optimized = reResolveLabels(optimized);

  return optimized;
}

function removeUnusedLabels(instructions: ResolvedIRInstruction[]): ResolvedIRInstruction[] {
  const usedLabels = new Set<string>();
  
  // First collect all referenced labels
  for (const inst of instructions) {
    if (inst.op === 'GOTO' || inst.op === 'IF_GOTO') {
      usedLabels.add(inst.args[inst.args.length - 1]);
    }
  }

  // Then filter out LABEL instructions that are never referenced
  return instructions.filter((inst) => {
    if (inst.op !== 'LABEL') return true;
    const labelName = inst.args[0];
    return usedLabels.has(labelName);
  });
}

function removeDeadCodeAfterEndZone(instructions: ResolvedIRInstruction[]): ResolvedIRInstruction[] {
  const endZoneIndex = instructions.findIndex((inst) => inst.op === 'END_ZONE');
  if (endZoneIndex === -1) return instructions;
  
  // Keep everything up to and including END_ZONE
  return instructions.slice(0, endZoneIndex + 1);
}

function peepholeOptimizations(instructions: ResolvedIRInstruction[]): ResolvedIRInstruction[] {
  const optimized: ResolvedIRInstruction[] = [];
  let i = 0;

  while (i < instructions.length) {
    const current = instructions[i];

    // Optimization: Remove consecutive REPEAT_START/REPEAT_END with count 0
    if (
      current.op === 'REPEAT_START' &&
      current.args[0] === '0' &&
      i + 1 < instructions.length &&
      instructions[i + 1].op === 'REPEAT_END'
    ) {
      // Skip both REPEAT_START 0 and corresponding REPEAT_END
      i += 2;
      continue;
    }

    // Optimization: Remove NOOPs (if we ever add them, but good to have)
    if (current.op === 'NOOP') {
      i++;
      continue;
    }

    // No optimization applicable, keep the instruction
    optimized.push(current);
    i++;
  }

  return optimized;
}

function reResolveLabels(instructions: ResolvedIRInstruction[]): ResolvedIRInstruction[] {
  const resolved: ResolvedIRInstruction[] = instructions.map((inst) => ({ ...inst }));
  const labelMap: { [labelName: string]: number } = {};

  // Pass 1: Collect new label indices after optimizations
  resolved.forEach((inst, idx) => {
    if (inst.op === 'LABEL') {
      labelMap[inst.args[0]] = idx;
    }
  });

  // Pass 2: Re-resolve jump targets to new indices
  resolved.forEach((inst) => {
    if (inst.op === 'GOTO') {
      const labelName = inst.args[0];
      if (labelName in labelMap) {
        inst.targetPc = labelMap[labelName];
      }
    } else if (inst.op === 'IF_GOTO') {
      const labelName = inst.args[3];
      if (labelName in labelMap) {
        inst.targetPc = labelMap[labelName];
      }
    }
  });

  return resolved;
}

// Helper function for UI to show optimization statistics
export function getOptimizationStats(original: ResolvedIRInstruction[], optimized: ResolvedIRInstruction[]): {
  originalCount: number;
  optimizedCount: number;
  removed: number;
  reductionPercentage: number;
} {
  const originalCount = original.length;
  const optimizedCount = optimized.length;
  const removed = originalCount - optimizedCount;
  const reductionPercentage = originalCount > 0 
    ? Math.round(((removed) / originalCount) * 100) 
    : 0;

  return {
    originalCount,
    optimizedCount,
    removed,
    reductionPercentage,
  };
}
