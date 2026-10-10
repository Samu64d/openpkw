//
// MappedByteBuffer.ts
//

import MathHelper from "../../math/MathHelper.ts";
import Spannable from "../../memory/Spannable.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import FileHandler from "../file/FileHandler.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";
import ByteBuffer from "./ByteBuffer.ts";

@Disposable()
export default class MappedByteBuffer extends BaseByteBuffer implements Disposable.Target {

	private static readonly DEFAULT_CHUNK_LENGTH: number = 128;

	private readonly handler: FileHandler;
	private readonly chunkLength: number;
	private readonly chunkBuffer: ArrayBuffer;
	private readonly chunkView: Uint8Array;
	private chunkPosition: number;

	public constructor(handler: FileHandler) {
		super(handler.getSize(), handler.isReadonly());

		let chunkLength: number = MappedByteBuffer.DEFAULT_CHUNK_LENGTH;
		if (this.capacity < chunkLength) {
			chunkLength = MathHelper.findPrevPowerOfTwo(this.capacity);
		}
		chunkLength = 4;

		this.handler = handler;
		this.chunkLength = chunkLength;
		this.chunkBuffer = MappedByteBuffer.allocateArrayBuffer(chunkLength);
		this.chunkView = new Uint8Array(this.chunkBuffer).subarray(0, chunkLength);
		this.chunkPosition = -1;
	}

	public override unsafeGetSourceView(): Spannable {
		return new Array();
	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of file bounds access: got " + position + ".");
		}

		this.syncReadChunk(position);
		return this.chunkView[position - this.chunkPosition];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of file bounds access: got " + position + ".");
		}

		this.syncReadChunk(position);
		this.chunkView[position - this.chunkPosition] = value;
		this.writeChunk();
	}

	public override setArray(position: number, array: ArrayLike<number>): void {
		//TODO:
	}

	public override fill(value: number, startPosition: number = 0, endPosition: number = this.capacity): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, endPosition) == false) {
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

			this.chunkView.fill(value, writeOffset, writeOffset + writeLength);
			this.writeChunk();

			currentPosition += writeLength;
		}
	}

	public override copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number = 0, sourceEndPosition: number = this.capacity, destinationStartPosition: number = 0): void {
		//TODO:
	}

	public override slice(startPosition: number, endPosition: number): ByteBufferView {
		//TODO:
	}

	public override toArray(startPosition: number, endPosition: number): number[] {
		//TODO:
	}

	public dispose(): void {
		MappedByteBuffer.freeArrayBuffer(this.chunkBuffer);
	}

	private getChunkPosition(position: number): number {
		return Math.floor(position / this.chunkLength) * this.chunkLength;
	}

	private readChunk(chunkPosition: number): void {
		const readLength: number = Math.min(this.chunkLength, this.capacity - chunkPosition);
		const chunkByteBuffer: ByteBuffer = ByteBuffer.FROM_ARRAY(this.chunkView);

		this.handler.readInto(readLength, chunkByteBuffer, chunkPosition);
		this.chunkView.set(chunkByteBuffer.toArray());
	}

	private syncReadChunk(position: number): void {
		const chunkPosition: number = this.getChunkPosition(position);

		if (chunkPosition == this.chunkPosition) {
			return;
		}

		this.readChunk(chunkPosition);
		this.chunkPosition = chunkPosition;
	}

	private writeChunk(): void {
		if (this.chunkPosition == -1) {
			throw new Error("Cannot write chunk at invalid position.");
		}

		const writeLength: number = Math.min(this.chunkLength, this.capacity - this.chunkPosition);
		const chunkByteBuffer: ByteBuffer = ByteBuffer.FROM_ARRAY(this.chunkView);

		this.handler.write(writeLength, chunkByteBuffer, this.chunkPosition);
	}

}
