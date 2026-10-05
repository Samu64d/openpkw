//
// BaseByteBuffer.ts
//

import Nullable from "../../common/Nullable.ts";
import Spannable from "../../memory/Spannable.ts";
import SpannablePoolAllocator from "../../memory/SizeablePoolAllocator.ts";
import Buffer from "./Buffer.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default abstract class BaseByteBuffer extends Buffer {

	protected static allocateArrayBuffer(byteLength: number): ArrayBuffer {
		if (byteLength < 0) {
			throw new Error("Byte length value cannot be negative: got " + byteLength + ".");
		}

		const arrayBuffer: Nullable<ArrayBuffer> = BaseByteBuffer.ARRAY_BUFFER_ALLOCATOR.malloc(byteLength);

		if (arrayBuffer == null) {
			throw new Error("Cannot allocate new array buffer of byte length: " + byteLength + ".");
		}

		return arrayBuffer;
	};

	protected static freeArrayBuffer(arrayBuffer: ArrayBuffer): void {
		ByteBuffer.ARRAY_BUFFER_ALLOCATOR.free(arrayBuffer);
	}

	private static readonly ARRAY_BUFFER_ALLOCATOR: SpannablePoolAllocator<ArrayBuffer> = new SpannablePoolAllocator<ArrayBuffer>(SpannablePoolAllocator.createItemFactory(ArrayBuffer));

	protected readonly readonly: boolean;

	protected constructor(capacity: number, readonly: boolean) {
		super(capacity, false);

		this.readonly = readonly;
	}

	public isReadonly(): boolean {
		return this.readonly;
	}

	public abstract unsafeGetSource(): Spannable;

	public abstract get(position: number): number;

	public abstract set(position: number, value: number): void;

	public abstract setArray(array: ArrayLike<number>, startPosition: number): void;

	public abstract fill(value: number, startPosition: number, endPosition: number): void;

	public abstract copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number, sourceEndPosition: number, destinationStartPosition: number): void;

	public abstract slice(startPosition: number, endPosition: number): BaseByteBuffer;

	public abstract toArray(startPosition: number, endPosition: number): number[];

}
