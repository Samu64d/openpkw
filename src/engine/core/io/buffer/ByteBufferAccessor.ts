//
// ByteBufferAccessor.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import BufferSeeker from "./BufferSeeker.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

export default abstract class ByteBufferAccessor<T extends BaseByteBuffer = BaseByteBuffer> extends BufferSeeker<T> {

	protected readonly defaultByteOrder: ByteOrder;

	public constructor(byteBuffer: T, defaultByteOrder: ByteOrder = ByteOrder.LITTLE_ENDIAN) {
		super(byteBuffer);

		this.defaultByteOrder = defaultByteOrder;
	}

	public getDefaultByteOrder(): ByteOrder {
		return this.defaultByteOrder;
	}

	protected isLittleEndian(byteOrder: Nullable<ByteOrder> = null): boolean {
		return (byteOrder ?? this.defaultByteOrder) == ByteOrder.LITTLE_ENDIAN;
	}

}
