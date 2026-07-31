// 
// Range.ts
//

import Record from "../reflection/decorators/Record.ts";
import MathHelper from "./MathHelper.ts";

@Record()
export default class Range {

	private readonly min: number;
	private readonly max: number;
	private readonly value: number;

	public constructor(min: number, max: number) {
		if (isNaN(min) || isNaN(max) || max - min <= 0) {
			throw new Error("Invalid range bounds.");
		}

		this.min = min;
		this.max = max;
		this.value = max - min;
	}

	public getMin(): number {
		return this.min;
	}

	public getMax(): number {
		return this.max;
	}

	public getValue(): number {
		return this.value;
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

	public inverseLerp(value: number): number {
		return MathHelper.inverseLerp(this.min, this.max, value);
	}

	public clone(): Range {
		return new Range(this.min, this.max);
	}

	public equals(range: Range): boolean {
		return this.min == range.min && this.max == range.max;
	}

}
