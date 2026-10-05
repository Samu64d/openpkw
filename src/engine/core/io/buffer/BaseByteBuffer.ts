//
// BaseByteBuffer.ts
//

import Comparable from "../../common/Comparable.ts";
import Nullable from "../../common/Nullable.ts";
import Spannable from "../../memory/Spannable.ts";
import SpannablePoolAllocator from "../../memory/SpannablePoolAllocator.ts";
import Buffer from "./Buffer.ts";
import ByteBuffer from "./ByteBuffer.ts";
import ByteBufferView from "./ByteBufferView.ts";

export default abstract class BaseByteBuffer extends Buffer implements Comparable<BaseByteBuffer> {

	protected static allocateUint8Array(length: number, fillValue: number = 0): Uint8Array {
		if (length < 0) {
			throw new Error("Length value cannot be negative: got " + length + ".");
		}

		const uint8Array: Nullable<Uint8Array> = BaseByteBuffer.ARRAY_ALLOCATOR.malloc(length);

		if (uint8Array == null) {
			throw new Error("Cannot allocate new array of length: " + length + ".");
		}

		uint8Array.fill(fillValue, 0, length);
		return uint8Array;
	};

	protected static freeUint8Array(uint8Array: Uint8Array): void {
		ByteBuffer.ARRAY_ALLOCATOR.free(uint8Array);
	}

	private static readonly ARRAY_ALLOCATOR: SpannablePoolAllocator<Uint8Array> = new SpannablePoolAllocator<Uint8Array>(SpannablePoolAllocator.createItemFactory(Uint8Array));

	protected readonly readonly: boolean;
	protected readonly viewSet: Set<ByteBufferView>;

	protected constructor(capacity: number, readonly: boolean) {
		super(capacity, false);

		this.readonly = readonly;
		this.viewSet = new Set<ByteBufferView>();
	}

	public isReadonly(): boolean {
		return this.readonly;
	}

	public abstract unsafeGetSource(): Spannable;

	public abstract get(position: number): number;

	public abstract set(position: number, value: number): void;

	public abstract fill(value: number, startPosition: number, endPosition: number): void;

	public abstract copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number, sourceEndPosition: number, destinationStartPosition: number): void;

	public abstract toArray(startPosition: number, endPosition: number): number[];

	public abstract setArray(data: ArrayLike<number>, start: number): void;

	public abstract view(startPosition: number, endPosition: number): ByteBufferView;

	public abstract equals(byteBuffer: BaseByteBuffer): boolean;

}
