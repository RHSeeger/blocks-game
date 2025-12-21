import type { Cube } from "./cube";

export type GroupCollectionInfo = {
  clickedIndex: number; // The index of the block that was clicked
  clickedColor: string | null; // The color of the block that was clicked
  groupIndicesBeforeSpecial: number[]; // Indices in the group before special expansion (including special blocks)
  groupIndicesAfterSpecial: number[]; // Indices in the group after special expansion (including special blocks)
  nonSpecialGroupIndices: number[]; // Indices in the group after special expansion, only non-special blocks
  specialGroupIndices: number[]; // Indices in the group after special expansion, only special blocks

  // Derived info methods
  getGroupSizeBeforeSpecial(): number;
  getGroupSizeAfterSpecial(): number;
  getNonSpecialGroupSize(): number;
  getSpecialGroupSize(): number;
};

export function createGroupCollectionInfo(
  cubes: Cube[],
  clickedIndex: number,
  getConnectedIndices: (startIdx: number) => number[],
  getConnectedIndicesBeforeSpecial?: (startIdx: number) => number[]
): GroupCollectionInfo {
  const clickedColor = cubes[clickedIndex]?.color ?? null;
  // Step 1: Get group before special expansion (if provided)
  let groupIndicesBeforeSpecial: number[];
  if (getConnectedIndicesBeforeSpecial) {
    groupIndicesBeforeSpecial = getConnectedIndicesBeforeSpecial(clickedIndex);
  } else {
    // Fallback: use after-special as before-special if not provided
    const visited = new Set<number>();
    const toVisit = [clickedIndex];
    while (toVisit.length > 0) {
      const idx = toVisit.pop()!;
      if (visited.has(idx)) continue;
      visited.add(idx);
      const row = Math.floor(idx / 10);
      const col = idx % 10;
      const neighbors: number[] = [];
      if (row > 0) neighbors.push(idx - 10);
      if (row < 9) neighbors.push(idx + 10);
      if (col > 0) neighbors.push(idx - 1);
      if (col < 9) neighbors.push(idx + 1);
      for (const nIdx of neighbors) {
        if (visited.has(nIdx)) continue;
        const neighbor = cubes[nIdx];
        if (neighbor.color === null) continue;
        if (neighbor.special) {
          visited.add(nIdx);
          continue;
        }
        if (neighbor.color === clickedColor) {
          toVisit.push(nIdx);
        }
      }
    }
    groupIndicesBeforeSpecial = Array.from(visited);
  }
  // Step 2: Get group after special expansion, filter out empty/removed blocks
  const groupIndicesAfterSpecial = getConnectedIndices(clickedIndex)
    .filter(idx => cubes[idx].color !== null);
  // Step 3: Partition after-special group into non-special and special
  const nonSpecialGroupIndices = groupIndicesAfterSpecial.filter(idx => !cubes[idx].special);
  const specialGroupIndices = groupIndicesAfterSpecial.filter(idx => cubes[idx].special);
  // Step 4: Return info object with methods
  return {
    clickedIndex,
    clickedColor,
    groupIndicesBeforeSpecial,
    groupIndicesAfterSpecial,
    nonSpecialGroupIndices,
    specialGroupIndices,
    getGroupSizeBeforeSpecial() { return this.groupIndicesBeforeSpecial.length; },
    getGroupSizeAfterSpecial() { return this.groupIndicesAfterSpecial.length; },
    getNonSpecialGroupSize() { return this.nonSpecialGroupIndices.length; },
    getSpecialGroupSize() { return this.specialGroupIndices.length; },
  };
}
