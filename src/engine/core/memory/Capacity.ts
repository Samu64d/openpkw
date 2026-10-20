//
// Capacity.ts
//

import ArgumentOutOfRangeException from "../exception/ArgumentOutOfRangeException.ts";
import InvalidOperationException from "../exception/InvalidOperationException.ts";

export default abstract class Capacity {

	protected capacity: number;
	protected readonly resizable: boolean;

	public constructor(capacity: number, resizable: boolean = false) {
		ArgumentOutOfRangeException.throwIfLessThan(capacity, 0, "capacity")

		this.capacity = capacity;
		this.resizable = resizable;
	}

	public getCapacity(): number {
		return this.capacity;
	}

	public isResizable(): boolean {
		return this.resizable;
	}

	public grow(length: number): void {
		if (this.resizable == false) {
			throw new InvalidOperationException("Cannot grow unresizable item");
		}
		ArgumentOutOfRangeException.throwIfLessThan(length, 0, "length");

		this.capacity += length;
	}

	public shrink(length: number): void {
		if (this.resizable == false) {
			throw new InvalidOperationException("Cannot shrink unresizable item");
		}
		ArgumentOutOfRangeException.throwIfLessThan(length, 0, "length");
		ArgumentOutOfRangeException.throwIfGreaterThan(length, 0, "capacity");

		this.capacity -= length;
	}

}
