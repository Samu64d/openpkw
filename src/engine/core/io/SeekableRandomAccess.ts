//
// SeekableRandomAccess.ts
//

import Nullable from "../common/Nullable.ts";
import RandomAccess from "./RandomAccess.ts";

export default abstract class SeekableRandomAccess extends RandomAccess {

	private cursor: number;

	public constructor(size: number, resizable: boolean = false) {
		super(size, resizable);
		this.cursor = 0;
	}

	public override shrink(length: number): void {
		super.shrink(length);
		if (this.cursor > this.getSize()) {
			this.cursor = this.getSize();
		}
	}

	public getCursor(): number {
		return this.cursor;
	}

	public seek(position: number): void {
		if (position < 0 || position > this.getSize()) {
			throw new Error("Out of bounds access.");
		}
		this.cursor = position;
	}

	public skip(length: number): void {
		if (length < 0) {
			throw new Error("Cannot skip with a negative value.");
		}
		this.seek(this.cursor + length);
	}

	public rewind(length: number): void {
		if (length < 0) {
			throw new Error("Cannot rewind with a negative value.");
		}
		this.seek(this.cursor - length);
	}

	public remainingLength(): number {
		return this.getSize() - this.cursor;
	}

	public isEof(): boolean {
		return this.cursor >= this.getSize();
	}

	public reset(): void {
		this.seek(0);
	}

	protected resolvePositionForAccess(position: Nullable<number> = this.cursor, length: number): number {
		const resolvedPosition: number = position ?? this.cursor;
		if (this.isWithinBounds(resolvedPosition, length) == false) {
			throw new Error("Cannot access position: out of bounds.");
		}
		return resolvedPosition;
	}

	protected resolvePositionForCapacity(position: Nullable<number> = this.cursor, length: number): number {
		const resolvedPosition: number = position ?? this.cursor;
		if (this.hasCapacityFor(resolvedPosition, length) == false) {
			throw new Error("Cannot access position: out of capacity.");
		}
		return resolvedPosition;
	}

	protected advanceIfUnspecified(length: number, value: Nullable<number>) {
		if (value == null) {
			this.skip(length);
		}
	}

}
