//
// BufferSeeker.ts
//

import Nullable from "../../common/Nullable.ts";
import Buffer from "./Buffer.ts";

export default abstract class BufferSeeker<T extends Buffer> {

	protected readonly buffer: T;
	private position: number;

	public constructor(buffer: T) {
		this.buffer = buffer;
		this.position = 0;
	}

	public getBuffer(): T {
		return this.buffer;
	}

	public getPosition(): number {
		return this.position;
	}

	public seek(position: number): void {
		if (position < 0 || position > this.buffer.getCapacity()) {
			throw new Error("Out of bounds access: " + position + ".");
		}

		this.position = position;
	}

	public skip(length: number): void {
		if (length < 0) {
			throw new Error("Cannot skip with a negative value: got " + length + ".");
		}

		this.seek(this.position + length);
	}

	public rewind(length: number): void {
		if (length < 0) {
			throw new Error("Cannot rewind with a negative value: got " + length + ".");
		}

		this.seek(this.position - length);
	}

	public remaining(): number {
		return Math.max(0, this.buffer.getCapacity() - this.position);
	}

	public isEof(): boolean {
		return this.position >= this.buffer.getCapacity();
	}

	public reset(): void {
		this.seek(0);
	}

	protected resolvePositionForAccess(position: Nullable<number>, length: number): number {
		const resolvedPosition: number = position ?? this.position;
		if (this.buffer.isRangeWithinBounds(resolvedPosition, length) == false) {
			throw new Error("Cannot access position: out of bounds.");
		}

		return resolvedPosition;
	}

	protected resolvePositionForCapacity(position: Nullable<number>, length: number): number {
		const resolvedPosition: number = position ?? this.position;
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
