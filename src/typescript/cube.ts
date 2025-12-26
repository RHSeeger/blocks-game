// Cube type
// ---------
// This file defines the Cube type, representing a single block on the board. It may have a color and an optional special property (e.g., 'plus1').

export type Cube = {
    color: string | null; // null means blank
    special?: 'plus1'; // Optional: 'plus1' for +1 Block
};
