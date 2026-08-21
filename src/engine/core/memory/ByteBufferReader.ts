//
// ByteBufferReader.ts
//

import Nullable from "../common/Nullable.ts";
import SeekableRandomAccess from "../io/SeekableRandomAccess.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import Endian from "./Endian.ts";
import ByteBuffer from "./ByteBuffer.ts";

@Disposable()
export default class ByteBufferReader extends SeekableRandomAccess implements Disposable.Target {

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

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 1);
		const value: number = this.byteBuffer.get(resolvedPosition);
		this.advanceIfUnspecified(1, position);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 2);

		let value: number;
		if (this.isLittleEndian(endianness)) {
			const b0: number = this.byteBuffer.get(resolvedPosition);
			const b1: number = this.byteBuffer.get(resolvedPosition + 1) << 8;
			value = b0 | b1;
		} else {
			const b0: number = this.byteBuffer.get(resolvedPosition) << 8;
			const b1: number = this.byteBuffer.get(resolvedPosition + 1);
			value = b0 | b1;
		}

		this.advanceIfUnspecified(2, position);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 3);

		let value: number;
		if (this.isLittleEndian(endianness)) {
			const b0: number = this.byteBuffer.get(resolvedPosition);
			const b1: number = this.byteBuffer.get(resolvedPosition + 1) << 8;
			const b2: number = this.byteBuffer.get(resolvedPosition + 2) << 16;
			value = b0 | b1 | b2;
		} else {
			const b0: number = this.byteBuffer.get(resolvedPosition) << 16;
			const b1: number = this.byteBuffer.get(resolvedPosition + 1) << 8;
			const b2: number = this.byteBuffer.get(resolvedPosition + 2);
			value = b0 | b1 | b2;
		}

		this.advanceIfUnspecified(3, position);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 4);

		let value: number;
		if (this.isLittleEndian(endianness)) {
			const b0: number = this.byteBuffer.get(resolvedPosition);
			const b1: number = this.byteBuffer.get(resolvedPosition + 1) << 8;
			const b2: number = this.byteBuffer.get(resolvedPosition + 2) << 16;
			const b3: number = this.byteBuffer.get(resolvedPosition + 3) << 24;
			value = (b0 | b1 | b2 | b3) >>> 0;
		} else {
			const b0: number = this.byteBuffer.get(resolvedPosition) << 24;
			const b1: number = this.byteBuffer.get(resolvedPosition + 1) << 16;
			const b2: number = this.byteBuffer.get(resolvedPosition + 2) << 8;
			const b3: number = this.byteBuffer.get(resolvedPosition + 3);
			value = (b0 | b1 | b2 | b3) >>> 0;
		}

		this.advanceIfUnspecified(4, position);
		return value;
	}

	public dispose(): void { }

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
