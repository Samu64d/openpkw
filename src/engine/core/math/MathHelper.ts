// 
// MathHelper.ts
//

export default class MathHelper {

	public static mod(value: number, modulus: number): number {
		return ((value % modulus) + modulus) % modulus;
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

	public static lerp(value0: number, value1: number, t: number): number {
		return (1 - t) * value0 + t * value1;
	}

	public static inverseLerp(value0: number, value1: number, t: number): number {
		const range: number = value1 - value0;

		if (range == 0) {
			return 0;
		}

		return (t - value0) / range;
	}

	public static findPrevPowerOfTwo(value: number): number {
		if (value <= 1) {
			return 1;
		}

		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		return value - (value >>> 1);
	}

	public static findNextPowerOfTwo(value: number): number {
		if (value <= 1) {
			return 1;
		}

		value--;
		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		return ++value;
	}

	private constructor() {
	}

}
