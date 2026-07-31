//
// Seekable.ts
//

export default abstract class Seekable {

	protected size: number;
	protected cursor: number;

	public constructor(size: number) {
		if (size < 0) {
			throw new Error("Invalid size value.");
		}
		this.size = size;
		this.cursor = 0;
	}

	public getSize(): number {
		return this.size;
	}

	public getCursor(): number {
		return this.cursor;
	}

	public seek(position: number): void {
		if (position < 0 || position > this.size) {
			throw new Error("Out of bounds access.");
		}
		this.cursor = position;
	}

	public skip(count: number): void {
		if (count < 0) {
			throw new Error("Cannot skip with negative values.");
		}
		this.seek(this.cursor + count);
	}

	public rewind(count: number): void {
		if (count < 0) {
			throw new Error("Cannot rewind with negative values.");
		}
		this.seek(this.cursor - count);
	}

	public remaining(): number {
		return this.size - this.cursor;
	}

	public isEof(): boolean {
		return this.cursor >= this.size;
	}

	public reset(): void {
		this.seek(0);
	}

	public isInBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position <= this.size - length;
	}

	protected advance(count: number): void {
		if (count < 0) {
			throw new Error("Cannot advance with negative values.");
		}
		this.seek(this.cursor + count);
	}

}
