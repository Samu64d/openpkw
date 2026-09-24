//
// SeekableAccessor.ts
//

import Nullable from "../common/Nullable.ts";
import Buffer from "../memory/Buffer.ts";

export default abstract class SeekableAccessor<T extends Buffer<unknown>> {

	protected readonly buffer: T;
	private cursor: number;

	public constructor(buffer: T) {
		this.buffer = buffer;
		this.cursor = 0;
	}

	public getBuffer(): T {
		return this.buffer;
	}

	public getCursor(): number {
		return this.cursor;
	}

	public seek(position: number): void {
		if (position < 0 || position > this.buffer.getSize()) {
			throw new Error("Out of bounds access: " + position + ".");
		}

		this.cursor = position;
	}

	public skip(length: number): void {
		if (length < 0) {
			throw new Error("Cannot skip with a negative value: got " + length + ".");
		}

		this.seek(this.cursor + length);
	}

	public rewind(length: number): void {
		if (length < 0) {
			throw new Error("Cannot rewind with a negative value: got " + length + ".");
		}

		this.seek(this.cursor - length);
	}

	public remainingLength(): number {
		return Math.max(0, this.buffer.getSize() - this.cursor);
	}

	public isEof(): boolean {
		return this.cursor >= this.buffer.getSize();
	}

	public reset(): void {
		this.seek(0);
	}

	protected resolvePositionForAccess(position: Nullable<number>, length: number): number {
		const resolvedPosition: number = position ?? this.cursor;
		if (this.buffer.isRangeWithinBounds(resolvedPosition, length) == false) {
			throw new Error("Cannot access position: out of bounds.");
		}

		return resolvedPosition;
	}

	protected resolvePositionForCapacity(position: Nullable<number>, length: number): number {
		const resolvedPosition: number = position ?? this.cursor;
		if (this.buffer.hasCapacityFor(resolvedPosition, length) == false) {
			throw new Error("Cannot access position: out of capacity.");
		}

		return resolvedPosition;
	}

	protected advanceIfUnspecified(length: number, position: Nullable<number> = null): void {
		if (position == null) {
			this.skip(length);
		}
	}

}
