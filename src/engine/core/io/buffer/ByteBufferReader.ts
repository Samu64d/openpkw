//
// ByteBufferReader.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import Spannable from "../../memory/Spannable.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";
import ByteBufferAccessor from "./ByteBufferAccessor.ts";

@Disposable()
export default class ByteBufferReader extends ByteBufferAccessor implements Disposable.Target {

	public constructor(byteBuffer: BaseByteBuffer, defaultByteOrder: ByteOrder = ByteOrder.LITTLE_ENDIAN) {
		super(byteBuffer, defaultByteOrder);
	}

	public readUint8(position: Nullable<number> = null): number {
		const src: Spannable = this.buffer.unsafeGetSourceView();
		const index: number = this.resolveAccess(position, 1, true);
		const value: number = src[index];

		this.resolveAdvance(position, 1);
		return value;
	}

	public readUint16(position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): number {
		const src: Spannable = this.buffer.unsafeGetSourceView();
		const index: number = this.resolveAccess(position, 2, true);
		let value: number;

		if (this.isLittleEndian(endianness) == true) {
			const b0: number = src[index];
			const b1: number = src[index + 1] << 8;
			value = b0 | b1;
		} else {
			const b0: number = src[index] << 8;
			const b1: number = src[index + 1];
			value = b0 | b1;
		}

		this.resolveAdvance(position, 2);
		return value;
	}

	public readUint24(position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): number {
		const src: Spannable = this.buffer.unsafeGetSourceView();
		const index: number = this.resolveAccess(position, 3, true);
		let value: number;

		if (this.isLittleEndian(endianness) == true) {
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

		this.resolveAdvance(position, 3);
		return value;
	}

	public readUint32(position: Nullable<number> = null, endianness: Nullable<ByteOrder> = null): number {
		const src: Spannable = this.buffer.unsafeGetSourceView();
		const index: number = this.resolveAccess(position, 4, true);
		let value: number;

		if (this.isLittleEndian(endianness) == true) {
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

		this.resolveAdvance(position, 4);
		return value;
	}

	public dispose(): void {
	}

}
