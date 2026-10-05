//
// ByteBufferAccessor.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteOrder from "../../memory/ByteOrder.ts";
import BufferSeeker from "./BufferSeeker.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

export default abstract class ByteBufferAccessor extends BufferSeeker<BaseByteBuffer> {

	protected readonly defaultByteOrder: ByteOrder;

	public constructor(buffer: BaseByteBuffer, defaultByteOrder: ByteOrder = ByteOrder.LITTLE_ENDIAN) {
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
