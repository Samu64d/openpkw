//
// ByteBufferWriter.ts
//

import Nullable from "../common/Nullable.ts";
import SeekableRandomAccess from "../io/SeekableRandomAccess.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import Endian from "./Endian.ts";
import ByteBuffer from "./ByteBuffer.ts";

@Disposable()
export default class ByteBufferWriter extends SeekableRandomAccess implements Disposable.Target {

	private readonly byteBuffer: ByteBuffer;
	private readonly defaultEndianness: Endian;

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer.getSize(), false);
		this.byteBuffer = byteBuffer;
		this.defaultEndianness = defaultEndianness;
	}

	public getByteBuffer(): ByteBuffer {
		return this.byteBuffer;
	}

	public getDefaultEndianness(): Endian {
		return this.defaultEndianness;
	}

	public writeUint8(value: number, position: Nullable<number> = null): void {
		const resolvedPosition: number = this.resolvePositionForCapacity(position, 1);
		this.byteBuffer.set(resolvedPosition, value);
		this.advanceIfUnspecified(1, position);
	}

	public writeUint16(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePositionForCapacity(position, 2);

		if (this.isLittleEndian(endianness)) {
			this.byteBuffer.set(resolvedPosition, value & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value >>> 8) & 0xFF);
		} else {
			this.byteBuffer.set(resolvedPosition, (value >>> 8) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value) & 0xFF);
		}

		this.advanceIfUnspecified(2, position);
	}

	public writeUint24(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePositionForCapacity(position, 3);

		if (this.isLittleEndian(endianness)) {
			this.byteBuffer.set(resolvedPosition, value & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value >>> 8) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 2, (value >>> 16) & 0xFF);
		} else {
			this.byteBuffer.set(resolvedPosition, (value >>> 16) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value >>> 8) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 2, value & 0xFF);
		}

		this.advanceIfUnspecified(3, position);
	}

	public writeUint32(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePositionForCapacity(position, 4);

		if (this.isLittleEndian(endianness)) {
			this.byteBuffer.set(resolvedPosition, value & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value >>> 8) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 2, (value >>> 16) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 3, (value >>> 24) & 0xFF);
		} else {
			this.byteBuffer.set(resolvedPosition, (value >>> 24) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 1, (value >>> 16) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 2, (value >>> 8) & 0xFF);
			this.byteBuffer.set(resolvedPosition + 3, value & 0xFF);
		}

		this.advanceIfUnspecified(4, position);
	}

	public dispose(): void {
	}

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
