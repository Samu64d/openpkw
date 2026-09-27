// 
// Range.ts
//

import Record from "../reflection/decorators/Record.ts";
import MathHelper from "./MathHelper.ts";

@Record()
export default class Range {

	private readonly min: number;
	private readonly max: number;
	private readonly size: number;

	public constructor(min: number, max: number) {
		if (max - min <= 0) {
			throw new Error("Invalid range bounds: " + min + ", " + max + ".");
		}

		this.min = min;
		this.max = max;
		this.size = max - min;
	}

	public getMin(): number {
		return this.min;
	}

	public getMax(): number {
		return this.max;
	}

	public getSize(): number {
		return this.size;
	}

	public inside(value: number): boolean {
		return value > this.min && value < this.max;
	}

	public include(value: number): boolean {
		return value >= this.min && value <= this.max;
	}

	public clamp(value: number): number {
		return MathHelper.clamp(value, this.min, this.max);
	}

	public lerp(value: number): number {
		return MathHelper.lerp(this.min, this.max, value);
	}

	public inverseLerp(value: number): number {
		return MathHelper.inverseLerp(this.min, this.max, value);
	}

	public clone(): Range {
		return new Range(this.min, this.max);
	}

	public equals(range: Range): boolean {
		return this === range || (this.min == range.min && this.max == range.max);
	}

}
