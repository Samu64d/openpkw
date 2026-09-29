//
// ByteBufferAccessor.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";
import BufferAccessor from "./BufferAccessor.ts";

export default abstract class ByteBufferAccessor<T extends BaseByteBuffer> extends BufferAccessor<T> {

	protected readonly defaultByteOrder: ByteOrder;

	public constructor(buffer: T, defaultByteOrder: ByteOrder = ByteOrder.LITTLE_ENDIAN) {
		super(buffer);

		this.defaultByteOrder = defaultByteOrder;
	}

	public getDefaultByteOrder(): ByteOrder {
		return this.defaultByteOrder;
	}

	protected isLittleEndian(byteOrder: Nullable<ByteOrder> = null): boolean {
		return (byteOrder ?? this.defaultByteOrder) == ByteOrder.LITTLE_ENDIAN;
	}

}
