// Extend the Window interface to include onCubeClicked
interface Window {
	onCubeClicked?: (cubeIndex: number, player: 'human' | 'computer', board: HTMLElement | null) => void;
}
declare module '*.css';
