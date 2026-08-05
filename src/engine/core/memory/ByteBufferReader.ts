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
	private readonly dataView: DataView;

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer.getSize(), false);
		this.byteBuffer = byteBuffer;
		this.defaultEndianness = defaultEndianness;
		this.dataView = new DataView(byteBuffer.unsafeGetData().buffer, 0, byteBuffer.getSize());
	}

	public getByteBuffer(): ByteBuffer {
		return this.byteBuffer;
	}

	public getDefaultEndianness(): Endian {
		return this.defaultEndianness;
	}

	public readUint8(position: Nullable<number> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 1);
		const value: number = this.dataView.getUint8(resolvedPosition);
		this.advanceIfUnspecified(1, position);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 2);
		const value: number = this.dataView.getUint16(resolvedPosition, this.isLittleEndian(endianness));
		this.advanceIfUnspecified(2, position);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 3);
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

		this.advanceIfUnspecified(3, position);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const resolvedPosition: number = this.resolvePositionForAccess(position, 4);
		const value: number = this.dataView.getUint32(resolvedPosition, this.isLittleEndian(endianness));
		this.advanceIfUnspecified(4, position);
		return value;
	}

	public dispose(): void { }

	private isLittleEndian(endianness: Nullable<Endian>): boolean {
		return (endianness ?? this.defaultEndianness) == Endian.LITTLE;
	}

}
