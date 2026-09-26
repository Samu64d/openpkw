//
// BaseByteBuffer.ts
//

import Nullable from "../../common/Nullable.ts";
import SpanPoolAllocator from "../../memory/SpanPoolAllocator.ts";
import Buffer from "./Buffer.ts";

export default abstract class BaseByteBuffer extends Buffer {

	protected static allocateUint8Array(size: number, fillValue: number = 0): Uint8Array {
		if (size < 0) {
			throw new Error("Size value cannot be negative: got " + size + ".");
		}

		const uint8Array: Nullable<Uint8Array> = BaseByteBuffer.UINT8_ARRAY_ALLOCATOR.malloc(size);

		if (uint8Array == null) {
			throw new Error("Cannot allocate new array of size: " + size + ".");
		}

		uint8Array.fill(fillValue, 0, size);
		return uint8Array;
	};

	protected static freeUint8Array(uint8Array: Uint8Array): void {
		BaseByteBuffer.UINT8_ARRAY_ALLOCATOR.free(uint8Array);
	}

	private static readonly UINT8_ARRAY_ALLOCATOR: SpanPoolAllocator<Uint8Array> = new SpanPoolAllocator<Uint8Array>(SpanPoolAllocator.FACTORY_OF(Uint8Array));

	protected readonly data: Uint8Array;

	protected constructor(data: Uint8Array, size: number) {
		super(size, false);
		this.data = data;
	}

	public unsafeGetData(): Uint8Array {
		return this.data.subarray(0, this.size);
	}

	public get(index: number): number {
		if (index < 0 || index >= this.size) {
			throw new Error("Out of bounds access: got " + index + ".");
		}

		return this.data[index];
	}

	public toArray(): number[] {
		return Array.from(this.data.subarray(0, this.size));
	}

	public equals(byteBuffer: BaseByteBuffer): boolean {
		if (this === byteBuffer) {
			return true;
		}

		if (this.size != byteBuffer.size) {
			return false;
		}

		for (let i: number = 0; i < this.size; i++) {
			if (this.data[i] != byteBuffer.data[i]) {
				return false;
			}
		}

		return true;
	}

}
