//
// ByteBufferWriter.ts
//

import Nullable from "../common/Nullable.ts";
import SeekableRandomAccess from "../io/common/SeekableRandomAccess.ts";
import Endian from "./Endian.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class ByteBufferWriter extends SeekableRandomAccess {

	private readonly byteBuffer: ByteBuffer;
	private readonly dataView: DataView;
	private readonly defaultEndianness: Endian;

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer.getSize());
		this.byteBuffer = byteBuffer;
		this.dataView = new DataView(byteBuffer.unsafeGetData().buffer, 0, byteBuffer.getSize());
		this.defaultEndianness = defaultEndianness;
	}

	public getByteBuffer(): ByteBuffer {
		return this.byteBuffer;
	}

	public getDefaultEndianness(): Endian {
		return this.defaultEndianness;
	}

	public writeUint8(value: number, position: Nullable<number> = null): void {
		const resolvedPosition: number = this.resolvePosition(position, 1);
		this.dataView.setUint8(resolvedPosition, value);
		this.skip(1);
	}

	public writeUint16(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePosition(position, 2);
		this.dataView.setUint16(resolvedPosition, value, this.isLittleEndian(endianness));
		this.skip(2);
	}

	public writeUint24(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePosition(position, 3);
		if (this.isLittleEndian(endianness)) {
			this.dataView.setUint8(resolvedPosition, value & 0xFF);
			this.dataView.setUint8(resolvedPosition + 1, (value >>> 8) & 0xFF);
			this.dataView.setUint8(resolvedPosition + 2, (value >>> 16) & 0xFF);
		} else {
			this.dataView.setUint8(resolvedPosition, (value >>> 16) & 0xFF);
			this.dataView.setUint8(resolvedPosition + 1, (value >>> 8) & 0xFF);
			this.dataView.setUint8(resolvedPosition + 2, value & 0xFF);
		}
		this.skip(3);
	}

	public writeUint32(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const resolvedPosition: number = this.resolvePosition(position, 4);
		this.dataView.setUint32(resolvedPosition, value, this.isLittleEndian(endianness));
		this.skip(4);
	}

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
