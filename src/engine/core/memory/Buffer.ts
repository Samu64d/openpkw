//
// Buffer.ts
//

export default abstract class Buffer<T> {

	protected size: number;
	protected readonly resizable: boolean;

	public constructor(size: number, resizable: boolean = false) {
		if (size < 0) {
			throw new Error("Size value cannot be negative: got " + size + ".");
		}

		this.size = size;
		this.resizable = resizable;
	}

	public getSize(): number {
		return this.size;
	}

	public isResizable(): boolean {
		return this.resizable;
	}

	public abstract get(index: number): T;

	public abstract set(index: number, value: T): void;

	public isRangeWithinBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position + length <= this.size;
	}

	public hasCapacityFor(position: number, length: number): boolean {
		if (this.resizable == false) {
			return this.isRangeWithinBounds(position, length);
		}

		return position >= 0 && length >= 0 && position <= this.size;
	}

	public grow(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot grow unresizable buffer.");
		}
		if (length < 0) {
			throw new Error("Cannot grow with negative values: got " + length + ".");
		}

		this.size += length;
	}

	public shrink(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot shrink unresizable item.");
		}
		if (length < 0 || length > this.size) {
			throw new Error("Cannot shrink with negative or outbounds values: got size " + this.size + ", length " + length + ".");
		}

		this.size -= length;
	}

}
