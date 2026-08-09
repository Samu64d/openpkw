//
// RandomAccess.ts
//

export default abstract class RandomAccess {

	private size: number;
	private readonly resizable: boolean;

	public constructor(size: number, resizable: boolean = false) {
		if (size < 0) {
			throw new Error("Size value must be greater than zero.");
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

	public isWithinBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position + length <= this.size;
	}

	public hasCapacityFor(position: number, length: number): boolean {
		if (this.resizable == false) {
			return this.isWithinBounds(position, length);
		}
		return position >= 0 && length >= 0 && position <= this.size;
	}

	public grow(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot grow unresizable item.");
		}
		if (length < 0) {
			throw new Error("Cannot grow with negative values.");
		}

		this.size += length;
	}

	public shrink(length: number): void {
		if (this.resizable == false) {
			throw new Error("Cannot shrink unresizable item.");
		}
		if (length < 0 || length > this.size) {
			throw new Error("Cannot shrink with negative or outbounds values.");
		}

		this.size -= length;
	}

}
