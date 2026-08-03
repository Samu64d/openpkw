//
// ByteBufferReader.ts
//

import Nullable from "../common/Nullable.ts";
import SeekableRandomAccess from "../io/common/SeekableRandomAccess.ts";
import Endian from "./Endian.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class ByteBufferReader extends SeekableRandomAccess {

	private readonly byteBuffer: ByteBuffer;
	private readonly dataView: DataView;
	private readonly defaultEndianness: Endian;

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer.getSize(), false);
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

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 1);
		const value: number = this.dataView.getUint8(resolvedPosition);
		this.skip(1);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 2);
		const value: number = this.dataView.getUint16(resolvedPosition, this.isLittleEndian(endianness));
		this.skip(2);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 3);
		let value: number;
		if (this.isLittleEndian(endianness)) {
			const b0: number = this.dataView.getUint8(resolvedPosition);
			const b1: number = this.dataView.getUint8(resolvedPosition + 1) << 8;
			const b2: number = this.dataView.getUint8(resolvedPosition + 2) << 16;
			value = b0 | b1 | b2;
		} else {
			const b0: number = this.dataView.getUint8(resolvedPosition) << 16;
			const b1: number = this.dataView.getUint8(resolvedPosition + 1) << 8;
			const b2: number = this.dataView.getUint8(resolvedPosition + 2);
			value = b0 | b1 | b2;
		}
		this.skip(3);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePosition(position, 4);
		const value = this.dataView.getUint32(resolvedPosition, this.isLittleEndian(endianness));
		this.skip(4);
		return value;
	}

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
