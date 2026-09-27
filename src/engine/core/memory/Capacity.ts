//
// Capacity.ts
//

export default abstract class Capacity {

	protected capacity: number;
	protected readonly resizable: boolean;

	public constructor(capacity: number, resizable: boolean = false) {
		if (capacity < 0) {
			throw new Error("Capacity value cannot be negative: got " + capacity + ".");
		}

		this.capacity = capacity;
		this.resizable = resizable;
	}

	public getCapacity(): number {
		return this.capacity;
	}

	public isResizable(): boolean {
		return this.resizable;
	}

	public isRangeWithinBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position + length <= this.capacity;
	}

	public hasCapacityFor(position: number, length: number): boolean {
		if (this.resizable == false) {
			return this.isRangeWithinBounds(position, length);
		}

		return position >= 0 && length >= 0 && position <= this.capacity;
	}

	public grow(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot grow unresizable item.");
		}
		if (length < 0) {
			throw new Error("Cannot grow with negative values: got " + length + ".");
		}

		this.capacity += length;
	}

	public shrink(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot shrink unresizable item.");
		}
		if (length < 0 || length > this.capacity) {
			throw new Error("Cannot shrink with negative or outbounds values: got capacity " + this.capacity + ", length " + length + ".");
		}

		this.capacity -= length;
	}

}
