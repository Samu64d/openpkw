//
// ByteBufferReader.ts
//

import Nullable from "../common/Nullable.ts";
import Seekable from "../io/stream/Seekable.ts";
import Endian from "./Endian.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class ByteBufferReader extends Seekable {

	private readonly buffer: ByteBuffer;
	private readonly bufferSource: Buffer;
	private endianness: Endian;

	public constructor(buffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(buffer.getSize());
		this.buffer = buffer;
		this.bufferSource = buffer.unsafeGetBuffer();
		this.endianness = defaultEndianness;
	}

	public getBuffer(): ByteBuffer {
		return this.buffer;
	}

	public getDefaultEndianness(): Endian {
		return this.endianness;
	}

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 1);
		return this.bufferSource.readUint8(resolvedPosition);
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 2);
		if (this.isLittleEndian(endianness)) {
			return this.bufferSource.readUint16LE(resolvedPosition);
		} else {
			return this.bufferSource.readUint16BE(resolvedPosition);
		}
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 3);
		if (this.isLittleEndian(endianness)) {
			return (this.bufferSource.readUint8(resolvedPosition + 2) << 16) | this.bufferSource.readUint16LE(resolvedPosition);
		} else {
			return (this.bufferSource.readUint16BE(resolvedPosition) << 8) | this.bufferSource.readUint8(resolvedPosition + 2);
		}
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 4);
		if (this.isLittleEndian(endianness)) {
			return this.bufferSource.readUint32LE(resolvedPosition);
		} else {
			return this.bufferSource.readUint32BE(resolvedPosition);
		}
	}

	private resolvePosition(position: Nullable<number>, length: number): number {
		if (position == null) {
			const currentCursor: number = this.cursor;
			this.advance(length);
			return currentCursor;
		} else if (!this.isInBounds(position, length)) {
			throw new Error("Out of bounds access.");
		}
		return position;
	}

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.endianness) == Endian.LITTLE;
	}

}
