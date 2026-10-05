//
// MappedByteBuffer.ts
//

import MathHelper from "../../math/MathHelper.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import FileHandler from "../file/FileHandler.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";
import ByteBuffer from "./ByteBuffer.ts";

@Disposable()
export default class MappedByteBuffer extends BaseByteBuffer implements Disposable.Target {

	private static readonly DEFAULT_CHUNK_LENGTH: number = 128;

	private readonly handler: FileHandler;
	private chunkPosition: number;
	private readonly chunkLength: number;
	private readonly chunk: Uint8Array;

	public constructor(handler: FileHandler) {
		super(handler.getSize(), handler.isReadonly());

		let chunkLength: number = MappedByteBuffer.DEFAULT_CHUNK_LENGTH;
		if (this.capacity < chunkLength) {
			chunkLength = MathHelper.findPrevPowerOfTwo(this.capacity);
		}
		chunkLength = 4;

		this.handler = handler;
		this.chunkLength = chunkLength;
		this.chunkPosition = -1;
		this.chunk = MappedByteBuffer.allocateUint8Array(chunkLength);
	}

	public override unsafeGetSource(): Spannable {

	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of file bounds access: got " + position + ".");
		}

		this.syncReadChunk(position);
		return this.chunk[position - this.chunkPosition];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of file bounds access: got " + position + ".");
		}

		this.syncReadChunk(position);
		this.chunk[position - this.chunkPosition] = value;
		this.writeChunk();
	}

	public override fill(value: number, startPosition: number = 0, endPosition: number = this.capacity): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		let currentPosition: number = startPosition;

		while (currentPosition < endPosition) {
			const chunkPosition: number = this.getChunkPosition(currentPosition);
			const writeOffset: number = currentPosition - chunkPosition;
			const length: number = Math.min(this.chunkLength, this.capacity - chunkPosition);
			const writeLength: number = Math.min(endPosition - currentPosition, length - writeOffset);

			if (writeOffset == 0 && length == writeLength) {
				this.chunkPosition = chunkPosition;
			} else {
				this.syncReadChunk(currentPosition);
			}

			this.chunk.fill(value, writeOffset, writeOffset + writeLength);
			alert(this.chunk.toString());
			this.writeChunk();

			currentPosition += writeLength;
		}
	}

	public override copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number, sourceEndPosition: number, destinationStartPosition: number): void {

	}

	public override toArray(startPosition: number, endPosition: number): number[] {

	}

	public override setArray(data: ArrayLike<number>, start: number): void {

	}

	public override view(startPosition: number, endPosition: number): ByteBufferView {

	}

	public override equals(byteBuffer: BaseByteBuffer): boolean {

	}

	public dispose(): void {
		MappedByteBuffer.freeUint8Array(this.chunk);
	}

	private getChunkPosition(position: number): number {
		return Math.floor(position / this.chunkLength) * this.chunkLength;
	}

	private readChunk(chunkPosition: number): void {
		const readLength: number = Math.min(this.chunkLength, this.capacity - chunkPosition);

		const x = ByteBuffer.FROM_ARRAY(this.chunk);
		this.handler.readInto(readLength, x, chunkPosition);
		this.chunk.set(x.toArray());
	}

	private syncReadChunk(position: number): void {
		const chunkPosition: number = this.getChunkPosition(position);

		if (chunkPosition != this.chunkPosition) {
			this.readChunk(chunkPosition);
			this.chunkPosition = chunkPosition;
		}
	}

	private writeChunk(): void {
		if (this.chunkPosition == -1) {
			throw new Error("Cannot write chunk at invalid position.");
		}

		const writeLength: number = Math.min(this.chunkLength, this.capacity - this.chunkPosition);

		const x = ByteBuffer.FROM_ARRAY(this.chunk);
		this.handler.write(writeLength, x, this.chunkPosition);
	}

}
