//
// SeekableRandomAccess.ts
//

import Nullable from "../../common/Nullable.ts";
import RandomAccess from "./RandomAccess.ts";

export default abstract class SeekableRandomAccess extends RandomAccess {

	protected cursor: number;

	public constructor(size: number, resizeable: boolean = false) {
		super(size, resizeable);
		this.cursor = 0;
	}

	public resolvePosition(position: Nullable<number>, length: number): number {
		if (position == null) {
			position = this.cursor;
		}
		if (this.canAccess(position, length) == false) {
			throw new Error("Cannot access index.");
		}
		return position;
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

	public skip(length: number): void {
		if (length < 0) {
			throw new Error("Cannot skip with negative values.");
		}
		this.seek(this.cursor + length);
	}

	public rewind(length: number): void {
		if (length < 0) {
			throw new Error("Cannot rewind with negative values.");
		}
		this.seek(this.cursor - length);
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

}
