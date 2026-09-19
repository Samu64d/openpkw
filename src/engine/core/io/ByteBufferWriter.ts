//
// ByteBufferWriter.ts
//

import Nullable from "../common/Nullable.ts";
import Endian from "../memory/Endian.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import BinaryAccessor from "./BinaryAccessor.ts";

@Disposable()
export default class ByteBufferWriter extends BinaryAccessor<ByteBuffer> implements Disposable.Target {

	public constructor(byteBuffer: ByteBuffer, defaultEndianness: Endian = Endian.LITTLE) {
		super(byteBuffer, defaultEndianness);
	}

	public writeUint8(value: number, position: Nullable<number> = null): void {
		const index: number = this.resolvePositionForCapacity(position, 1);
		const dest: Uint8Array = this.buffer.unsafeGetData();

		dest[index] = value & 0xFF;
		this.advanceIfUnspecified(1, position);
	}

	public writeUint16(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const index: number = this.resolvePositionForCapacity(position, 2);
		const dest: Uint8Array = this.buffer.unsafeGetData();

		if (this.isLittleEndian(endianness)) {
			dest[index] = value & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
		} else {
			dest[index] = (value >>> 8) & 0xFF;
			dest[index + 1] = value & 0xFF;
		}

		this.advanceIfUnspecified(2, position);
	}

	public writeUint24(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const index: number = this.resolvePositionForCapacity(position, 3);
		const dest: Uint8Array = this.buffer.unsafeGetData();

		if (this.isLittleEndian(endianness)) {
			dest[index] = value & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
			dest[index + 2] = (value >>> 16) & 0xFF;
		} else {
			dest[index] = (value >>> 16) & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
			dest[index + 2] = value & 0xFF;
		}

		this.advanceIfUnspecified(3, position);
	}

	public writeUint32(value: number, position: Nullable<number> = null, endianness: Nullable<Endian> = null): void {
		const index: number = this.resolvePositionForCapacity(position, 4);
		const dest: Uint8Array = this.buffer.unsafeGetData();

		if (this.isLittleEndian(endianness)) {
			dest[index] = value & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
			dest[index + 2] = (value >>> 16) & 0xFF;
			dest[index + 3] = (value >>> 24) & 0xFF;
		} else {
			dest[index] = (value >>> 24) & 0xFF;
			dest[index + 1] = (value >>> 16) & 0xFF;
			dest[index + 2] = (value >>> 8) & 0xFF;
			dest[index + 3] = value & 0xFF;
		}

		this.advanceIfUnspecified(4, position);
	}

	public dispose(): void {
	}

}
