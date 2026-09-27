// 
// MathHelper.ts
//

export default class MathHelper {

	public static mod(n: number, m: number): number {
		return ((n % m) + m) % m;
	}

	public static clamp(value: number, min: number, max: number): number {
		if (value <= min) {
			return min;
		}

		if (value >= max) {
			return max;
		}

		return value;
	}

	public static lerp(v0: number, v1: number, t: number): number {
		return (v1 - v0) * t + v0;
	}

	public static inverseLerp(v0: number, v1: number, t: number): number {
		const range: number = v1 - v0;
		if (range == 0) {
			return 0;
		}

		return (t - v0) / range;
	}

	public static findNextPowerOfTwo(x: number): number {
		if (x <= 1) {
			return 1;
		}

		x--;
		x |= x >> 1;
		x |= x >> 2;
		x |= x >> 4;
		x |= x >> 8;
		x |= x >> 16;
		return ++x;
	}

	private constructor() {
	}

}
