// 
// PerlinNoise.ts
//

import Vector3d from "./Vector3d.ts";

export default class PerlinNoise {

	private static readonly GRID_SIZE: number = 256;

	// Hash lookup table as defined by Ken Perlin
	private static readonly DEFAULT_PERMUTATION_MAP: number[] = [151, 160, 137, 91, 90, 15, 131, 13,
		201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190,
		6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
		88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
		77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
		102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
		135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
		5, 202, 38, 147, 118, 126, 6, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
		223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
		129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
		251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
		49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
		138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
	];

	// Gradient vectors
	private static readonly GRADIENT_VECTOR_LIST: Vector3d[] = [
		new Vector3d(1, 1, 0),
		new Vector3d(-1, 1, 0),
		new Vector3d(1, -1, 0),
		new Vector3d(-1, -1, 0),
		new Vector3d(1, 0, 1),
		new Vector3d(-1, 0, 1),
		new Vector3d(1, 0, -1),
		new Vector3d(-1, 0, -1),
		new Vector3d(0, 1, 1),
		new Vector3d(0, -1, 1),
		new Vector3d(0, 1, -1),
		new Vector3d(0, -1, -1)
	];

	private static dot(gradient: Vector3d, x: number, y: number, z: number): number {
		return gradient.getX() * x + gradient.getY() * y + gradient.getZ() * z;
	}

	private static fade(t: number): number {
		return ((6.0 * t - 15.0) * t + 10.0) * t * t * t;
	}

	private static mix(v0: number, v1: number, t: number): number {
		return (1.0 - t) * v0 + t * v1;
	}

	private readonly seed: number;
	private readonly zoom: number;
	private perm: number[];

	public constructor(seed: number, zoom: number = 1.0) {
		this.seed = seed;
		this.zoom = zoom;
		this.perm = new Array<number>(PerlinNoise.DEFAULT_PERMUTATION_MAP.length * 2);
		this.buildPermutations();
	}

	public getSeed(): number {
		return this.seed;
	}

	public getZoom(): number {
		return this.zoom;
	}

	public getValueAt(x: number, y: number, z: number): number {

		// We simulate a zoom effect simply multipling by a scalar factor
		x = (x * this.zoom) % PerlinNoise.GRID_SIZE;
		y = (y * this.zoom) % PerlinNoise.GRID_SIZE;
		z = (z * this.zoom) % PerlinNoise.GRID_SIZE;

		// Find unit grid cell containing point
		const xu: number = Math.floor(x);
		const yu: number = Math.floor(y);
		const zu: number = Math.floor(z);

		// Get relative xyz coordinates of 
		const xr: number = x - xu;
		const yr: number = y - yu;
		const zr: number = z - zu;

		// Compute the fade curve value for each of x, y, z
		const u: number = PerlinNoise.fade(xr);
		const v: number = PerlinNoise.fade(yr);
		const w: number = PerlinNoise.fade(zr);

		// Calculate a set of eight hashed gradient indices d
		const gi000: number = this.perm[this.perm[this.perm[zu] + yu] + xu] % 12;
		const gi001: number = this.perm[this.perm[this.perm[zu + 1] + yu] + xu] % 12;
		const gi010: number = this.perm[this.perm[this.perm[zu] + yu + 1] + xu] % 12;
		const gi011: number = this.perm[this.perm[this.perm[zu + 1] + yu + 1] + xu] % 12;
		const gi100: number = this.perm[this.perm[this.perm[zu] + yu] + xu + 1] % 12;
		const gi101: number = this.perm[this.perm[this.perm[zu + 1] + yu] + xu + 1] % 12;
		const gi110: number = this.perm[this.perm[this.perm[zu] + yu + 1] + xu + 1] % 12;
		const gi111: number = this.perm[this.perm[this.perm[zu + 1] + yu + 1] + xu + 1] % 12;

		const g000: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi000];
		const g001: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi001];
		const g010: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi010];
		const g011: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi011];
		const g100: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi100];
		const g101: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi101];
		const g110: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi110];
		const g111: Vector3d = PerlinNoise.GRADIENT_VECTOR_LIST[gi111];

		// Calculate noise contributions from each of the eight corners
		const n000: number = PerlinNoise.dot(g000, xr, yr, zr);
		const n100: number = PerlinNoise.dot(g100, xr - 1.0, yr, zr);
		const n010: number = PerlinNoise.dot(g010, xr, yr - 1.0, zr);
		const n110: number = PerlinNoise.dot(g110, xr - 1.0, yr - 1.0, zr);
		const n001: number = PerlinNoise.dot(g001, xr, yr, zr - 1.0);
		const n101: number = PerlinNoise.dot(g101, xr - 1.0, yr, zr - 1.0);
		const n011: number = PerlinNoise.dot(g011, xr, yr - 1.0, zr - 1.0);
		const n111: number = PerlinNoise.dot(g111, xr - 1.0, yr - 1.0, zr - 1.0);

		// Interpolate along x the contributions from each of the corners
		const nx00: number = PerlinNoise.mix(n000, n100, u);
		const nx01: number = PerlinNoise.mix(n001, n101, u);
		const nx10: number = PerlinNoise.mix(n010, n110, u);
		const nx11: number = PerlinNoise.mix(n011, n111, u);

		// Interpolate the four results along y
		const nxy0: number = PerlinNoise.mix(nx00, nx10, v);
		const nxy1: number = PerlinNoise.mix(nx01, nx11, v);

		// Interpolate the two last results along z
		const noiseValue: number = PerlinNoise.mix(nxy0, nxy1, w);

		return Math.max(0.0, Math.min(1.0, (noiseValue + 1) / 2));
	}

	private buildPermutations(): void {
		for (let i: number = 0; i < this.perm.length; i++) {
			this.perm[i] = (PerlinNoise.DEFAULT_PERMUTATION_MAP[i % 256] * this.seed) % 256;
		}
	}

}
