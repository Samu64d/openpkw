//
// BufferSeeker.ts
//

import Nullable from "../../common/Nullable.ts";
import ArgumentOutOfRangeException from "../../error/ArgumentOutOfRangeException.ts";
import IOException from "../../error/IOException.ts";
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
			throw new IOException("Cannot access position: out of bounds access: " + position);
		}

		this.position = position;
	}

	public skip(length: number): void {
		ArgumentOutOfRangeException.throwIfLessThan(length, 0, "length");

		this.seek(this.position + length);
	}

	public rewind(length: number): void {
		ArgumentOutOfRangeException.throwIfLessThan(length, 0, "length");

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

	protected resolveAccess(position: Nullable<number>, length: number, readonly: boolean = false): number {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(length, 0, "length");

		const startPosition: number = position ?? this.position;
		const endPosition: number = startPosition + length;
		const capacity: number = this.buffer.getCapacity();
		let flag: boolean = startPosition >= 0 && startPosition <= capacity;

		if (readonly || this.buffer.isResizable() == false) {
			flag &&= endPosition <= capacity;
		}

		if (flag == false) {
			throw new IOException("Cannot access position: out of capacity");
		}

		return startPosition;
	}

	protected resolveAdvance(position: Nullable<number>, length: number): void {
		if (position != null) {
			return;
		}

		this.skip(length);
	}

}
