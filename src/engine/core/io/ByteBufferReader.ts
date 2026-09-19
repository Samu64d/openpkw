//
// ByteBufferReader.ts
//

import Nullable from "../common/Nullable.ts";
import Endian from "../memory/Endian.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import BinaryAccessor from "./BinaryAccessor.ts";

@Disposable()
export default class ByteBufferReader extends BinaryAccessor<ByteBuffer> implements Disposable.Target {

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer, defaultEndianness);
	}

	public readUint8(position: Nullable<number> = null): number {
		const src: Uint8Array = this.buffer.unsafeGetData();
		const index: number = this.resolvePositionForAccess(position, 1);
		const value: number = src[index];

		this.advanceIfUnspecified(1, position);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const src: Uint8Array = this.buffer.unsafeGetData();
		const index: number = this.resolvePositionForAccess(position, 2);
		let value: number;

		if (this.isLittleEndian(endianness)) {
			const b0: number = src[index];
			const b1: number = src[index + 1] << 8;
			value = b0 | b1;
		} else {
			const b0: number = src[index] << 8;
			const b1: number = src[index + 1];
			value = b0 | b1;
		}

		this.advanceIfUnspecified(2, position);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const src: Uint8Array = this.buffer.unsafeGetData();
		const index: number = this.resolvePositionForAccess(position, 3);
		let value: number;

		if (this.isLittleEndian(endianness)) {
			const b0: number = src[index];
			const b1: number = src[index + 1] << 8;
			const b2: number = src[index + 2] << 16;
			value = b0 | b1 | b2;
		} else {
			const b0: number = src[index] << 16;
			const b1: number = src[index + 1] << 8;
			const b2: number = src[index + 2];
			value = b0 | b1 | b2;
		}

		this.advanceIfUnspecified(3, position);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<Endian> = null): number {
		const src: Uint8Array = this.buffer.unsafeGetData();
		const index: number = this.resolvePositionForAccess(position, 4);
		let value: number;

		if (this.isLittleEndian(endianness)) {
			const b0: number = src[index];
			const b1: number = src[index + 1] << 8;
			const b2: number = src[index + 2] << 16;
			const b3: number = src[index + 3] << 24;
			value = (b0 | b1 | b2 | b3) >>> 0;
		} else {
			const b0: number = src[index] << 24;
			const b1: number = src[index + 1] << 16;
			const b2: number = src[index + 2] << 8;
			const b3: number = src[index + 3];
			value = (b0 | b1 | b2 | b3) >>> 0;
		}

		this.advanceIfUnspecified(4, position);
		return value;
	}

	public dispose(): void {
	}

}
