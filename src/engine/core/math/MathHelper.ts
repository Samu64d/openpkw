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


	public static pointGradientCenterLerp(x: number, y: number, rx: number, ry: number): number {
		const dx: number = 1 - Math.abs(x * 2 - rx) / rx;
		const dy: number = 1 - Math.abs(y * 2 - ry) / ry;
		return Math.min(dx, dy);
	}

	private constructor() {
	}

}
