//
// RandomAccess.ts
//

export default abstract class RandomAccess {

	protected size: number;
	protected readonly resizeable: boolean;

	public constructor(size: number, resizeable: boolean = false) {
		if (size < 0) {
			throw new Error("Invalid size value.");
		}
		this.size = size;
		this.resizeable = resizeable;
	}

	public getSize(): number {
		return this.size;
	}

	public getResizeable(): Boolean {
		return this.resizeable;
	}

	public canAccess(position: number, length: number): boolean {
		if (this.resizeable == false) {
			return this.isInBounds(position, length);
		}
		return position <= this.size;
	}

	public resize(length: number): void {
		if (this.resizeable == false) {
			throw new Error("Cannot grow unresizeable item.");
		} else if (length < 0 && length > this.size) {
			throw new Error("Cannot resize .");
		}
		this.size += length;
	}

	private isInBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position <= this.size - length;
	}

}
