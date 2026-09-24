//
// ByteBuffer.ts
//

import Nullable from "../common/Nullable.ts";
import StringByteEncoder from "../codec/StringByteEncoder.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import TextEncoding from "./TextEncoding.ts";
import Buffer from "./Buffer.ts";
import ArrayLikePoolAllocator from "./ArrayLikePoolAllocator.ts";

@Disposable()
class ByteBuffer extends Buffer<number> implements Disposable.Target {

	public static readonly ALLOCATE: (size: number, fillValue?: number) => ByteBuffer = (size: number, fillValue: number = 0): ByteBuffer => {
		if (size < 0) {
			throw new Error("Size value cannot be negative: got " + size + ".");
		}

		const data: Nullable<Uint8Array> = ByteBuffer.UINT8_ARRAY_ALLOCATOR.malloc(size);

		if (data == null) {
			throw new Error("Cannot allocate new byte buffer.");
		}

		data.fill(fillValue, 0, size);

		return new ByteBuffer(data, size);
	};

	public static readonly FROM_ARRAY: (array: ArrayLike<number>) => ByteBuffer = (array: ArrayLike<number>): ByteBuffer => {
		const data: Nullable<Uint8Array> = ByteBuffer.UINT8_ARRAY_ALLOCATOR.malloc(array.length);

		if (data == null) {
			throw new Error("Cannot allocate new byte buffer.");
		}

		data.set(array);

		return new ByteBuffer(data, array.length);
	};

	public static readonly FROM_STRING: (string: string, textEncoding: TextEncoding) => ByteBuffer = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private static readonly UINT8_ARRAY_ALLOCATOR: ArrayLikePoolAllocator<Uint8Array> = new ArrayLikePoolAllocator<Uint8Array>(Uint8Array);

	protected readonly data: Uint8Array;
	private readonly viewSet: Set<ByteBuffer.View>;

	protected constructor(data: Uint8Array, size: number) {
		super(size);
		this.data = data;
		this.viewSet = new Set<ByteBuffer.View>();
	}

	public override get(index: number): number {
		if (index < 0 || index >= this.size) {
			throw new Error("Out of bounds access: got " + index + ".");
		}

		return this.data[index];
	}

	public override set(index: number, value: number): void {
		if (index < 0 || index >= this.size) {
			throw new Error("Out of bounds access: got " + index + ".");
		}

		this.data[index] = value;
	}

	public unsafeGetData(): Uint8Array {
		return this.data.subarray(0, this.size);
	}

	public setArray(data: ArrayLike<number>, start: number): void {
		if (this.isRangeWithinBounds(start, data.length) == false) {
			throw new Error("Out of bounds access.");
		}

		this.data.set(data, start);
	}

	public fill(fillValue: number, start: number = 0, end: number = this.size): void {
		if (this.isRangeWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		this.data.fill(fillValue, start, end);
	}

	public view(start: number = 0, end: number = this.size): ByteBuffer.View {
		if (this.isRangeWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		const view: ByteBuffer.View = new ByteBuffer.View(this, start, end);

		this.viewSet.add(view);
		return view;
	}

	public copyTo(byteBuffer: ByteBuffer, sourceStart: number = 0, sourceEnd: number = this.size, destinationStart: number = 0): void {
		const length: number = sourceEnd - sourceStart;
		if (this.isRangeWithinBounds(sourceStart, length) == false || byteBuffer.isRangeWithinBounds(destinationStart, length) == false) {
			throw new Error("Out of bounds access.");
		}

		byteBuffer.data.set(this.data.subarray(sourceStart, sourceEnd), destinationStart);
	}

	public toArray(): number[] {
		return Array.from(this.data.subarray(0, this.size));
	}

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.data.subarray(0, this.size));
	}

	public equals(byteBuffer: ByteBuffer): boolean {
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

	public removeView(view: ByteBuffer.View): void {
		this.viewSet.delete(view);
	}

	public dispose(): void {
		for (const view of this.viewSet) {
			if (Disposable.isDisposed(view) == false) {
				view.dispose();
			}
		}

		if ((this instanceof ByteBuffer.View) == false) {
			ByteBuffer.UINT8_ARRAY_ALLOCATOR.free(this.data);
		}
	}

}

namespace ByteBuffer {

	export class View extends ByteBuffer {

		private readonly parent: ByteBuffer;

		public constructor(source: ByteBuffer, start: number, end: number) {
			const subData: Uint8Array = source.unsafeGetData().subarray(start, end);
			super(subData, end - start);
			this.parent = source;
		}

		public getParent(): ByteBuffer {
			return this.parent;
		}

		public override dispose(): void {
			super.dispose();
			this.parent.removeView(this);
		}

	}

}

export default ByteBuffer;
