//
// ByteBufferReader.ts
//

import Nullable from "../foundation/Nullable.ts";
import ByteBuffer from "./ByteBuffer.ts";

class ByteBufferReader {

	private readonly buffer: ByteBuffer;
	private readonly bufferSource: Buffer;
	private readonly endianness: ByteBufferReader.Endian;
	private cursor: number;

	public constructor(buffer: ByteBuffer, endianess: ByteBufferReader.Endian = ByteBufferReader.Endian.BIG) {
		this.buffer = buffer;
		this.bufferSource = buffer.unsafeGetBuffer();
		this.endianness = endianess;
		this.cursor = 0;
	}

	public getBuffer(): ByteBuffer {
		return this.buffer;
	}

	public getEndianess(): ByteBufferReader.Endian {
		return this.endianness;
	}

	public getCursor(): number {
		return this.cursor;
	}

	public seek(position: number): void {
		if (position < 0 || position > this.buffer.getSize()) {
			throw new Error("Out of bounds access.");
		}
		this.cursor = position;
	}

	public skip(count: number): void {
		this.seek(this.cursor + count);
	}

	public rewind(count: number): void {
		this.seek(this.cursor - count);
	}

	public remaining(): number {
		return this.buffer.getSize() - this.cursor;
	}

	public isEof(): boolean {
		return this.cursor >= this.buffer.getSize();
	}

	public reset(): void {
		this.seek(0);
	}

	public readUint8(position: Nullable<number> = null): number {
		if (position == null) {
			position = this.cursor;
			this.advance(1);
		} else if (this.buffer.isInBounds(position, 1) == false) {
			throw new Error("Out of bounds access.");
		}

		return this.bufferSource.readUint8(position);
	}

	public readUint16(position: Nullable<number> = null): number {
		if (position == null) {
			position = this.cursor;
			this.advance(2)
		} else if (this.buffer.isInBounds(position, 2) == false) {
			throw new Error("Out of bounds access.");
		}

		if (this.isLittleEndian()) {
			return this.bufferSource.readUint16LE(position);
		} else {
			return this.bufferSource.readUint16BE(position);
		}
	}

	public readUint24(position: Nullable<number> = null): number {
		if (position == null) {
			position = this.cursor;
			this.advance(3);
		} else if (this.buffer.isInBounds(position, 3) == false) {
			throw new Error("Out of bounds access.");
		}

		if (this.isLittleEndian()) {
			return (this.bufferSource.readUint8(position + 2) << 16) | this.bufferSource.readUint16LE(position);
		} else {
			return (this.bufferSource.readUint16BE(position) << 8) | this.bufferSource.readUint8(position + 2);
		}
	}

	public readUint32(position: Nullable<number> = null): number {
		if (position == null) {
			position = this.cursor;
			this.advance(4);
		} else if (this.buffer.isInBounds(position, 4) == false) {
			throw new Error("Out of bounds access.");
		}

		if (this.isLittleEndian()) {
			return this.bufferSource.readUint32LE(position);
		} else {
			return this.bufferSource.readUint32BE(position);
		}
	}

	private advance(count: number): void {
		const newCursor = this.cursor + count;
		if (newCursor < 0 || newCursor > this.buffer.getSize()) {
			throw new Error("Out of bounds access.");
		}
		this.cursor = newCursor;
	}

	private isLittleEndian(): boolean {
		return this.endianness == ByteBufferReader.Endian.LITTLE;
	}

}

namespace ByteBufferReader {

	export const enum Endian {
		LITTLE,
		BIG
	}
}

export default ByteBufferReader;
