//
// ByteBufferWriter.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import Spannable from "../../memory/Spannable.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";
import ByteBufferAccessor from "./ByteBufferAccessor.ts";

@Disposable()
export default class ByteBufferWriter extends ByteBufferAccessor implements Disposable.Target {

	public constructor(byteBuffer: BaseByteBuffer, defaultByteOrder: ByteOrder = ByteOrder.LITTLE_ENDIAN) {
		super(byteBuffer, defaultByteOrder);
	}

	public writeUint8(value: number, position: Nullable<number> = null): void {
		const index: number = this.resolveAccess(position, 1, false);
		const dest: Spannable = this.buffer.unsafeGetSourceView();

		dest[index] = value & 0xFF;
		this.resolveAdvance(position, 1);
	}

	public writeUint16(value: number, position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): void {
		const index: number = this.resolveAccess(position, 2, false);
		const dest: Spannable = this.buffer.unsafeGetSourceView();

		if (this.isLittleEndian(endianness) == true) {
			dest[index] = value & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
		} else {
			dest[index] = (value >>> 8) & 0xFF;
			dest[index + 1] = value & 0xFF;
		}

		this.resolveAdvance(position, 2);
	}

	public writeUint24(value: number, position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): void {
		const index: number = this.resolveAccess(position, 3, false);
		const dest: Spannable = this.buffer.unsafeGetSourceView();

		if (this.isLittleEndian(endianness) == true) {
			dest[index] = value & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
			dest[index + 2] = (value >>> 16) & 0xFF;
		} else {
			dest[index] = (value >>> 16) & 0xFF;
			dest[index + 1] = (value >>> 8) & 0xFF;
			dest[index + 2] = value & 0xFF;
		}

		this.resolveAdvance(position, 3);
	}

	public writeUint32(value: number, position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): void {
		const index: number = this.resolveAccess(position, 4, false);
		const dest: Spannable = this.buffer.unsafeGetSourceView();

		if (this.isLittleEndian(endianness) == true) {
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

		this.resolveAdvance(position, 4);
	}

	public dispose(): void {
	}

}
