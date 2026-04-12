/**
 * A read-only view of a cube, used by the UI code when reading the state
 * (without being allowed to change it)
 */

export type CubeView = {
    color: string | null; // null means blank
    special?: 'plus1'; // Optional: 'plus1' for +1 Block

    getColor(): string | null;
    getSpecial(): 'plus1' | undefined;
};
