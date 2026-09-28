//
// BaseByteBuffer.ts
//

import Nullable from "../../common/Nullable.ts";
import SpanPoolAllocator from "../../memory/SpanPoolAllocator.ts";
import Buffer from "./Buffer.ts";

export default abstract class BaseByteBuffer extends Buffer {

	protected static allocateUint8Array(length: number, fillValue: number = 0): Uint8Array {
		if (length < 0) {
			throw new Error("Length value cannot be negative: got " + length + ".");
		}

		const uint8Array: Nullable<Uint8Array> = BaseByteBuffer.UINT8_ARRAY_ALLOCATOR.malloc(length);

		if (uint8Array == null) {
			throw new Error("Cannot allocate new array of length: " + length + ".");
		}

		uint8Array.fill(fillValue, 0, length);
		return uint8Array;
	};

	protected static freeUint8Array(uint8Array: Uint8Array): void {
		BaseByteBuffer.UINT8_ARRAY_ALLOCATOR.free(uint8Array);
	}

	private static readonly UINT8_ARRAY_ALLOCATOR: SpanPoolAllocator<Uint8Array> = new SpanPoolAllocator<Uint8Array>(SpanPoolAllocator.FACTORY_OF(Uint8Array));

	protected readonly data: Uint8Array;
	private readonly readonly: boolean;

	protected constructor(data: Uint8Array, capacity: number, readonly: boolean) {
		super(capacity, false);
		this.data = data;
		this.readonly = readonly;
	}

	public isReadonly(): boolean {
		return this.readonly;
	}

	public toArray(): number[] {
		return Array.from(this.data.subarray(0, this.capacity));
	}

	public equals(byteBuffer: BaseByteBuffer): boolean {
		if (this === byteBuffer) {
			return true;
		}

		if (this.capacity != byteBuffer.capacity) {
			return false;
		}

		for (let i: number = 0; i < this.capacity; i++) {
			if (this.data[i] != byteBuffer.data[i]) {
				return false;
			}
		}

		return true;
	}

}
