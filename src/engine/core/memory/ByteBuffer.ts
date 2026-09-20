//
// ByteBuffer.ts
//

import StringByteEncoder from "../codec/StringByteEncoder.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import TextEncoding from "./TextEncoding.ts";
import Buffer from "./Buffer.ts";

@Disposable()
class ByteBuffer extends Buffer<number> implements Disposable.Target {

	public static readonly ALLOCATE: (size: number, fillValue?: number) => ByteBuffer = (size: number, fillValue: number = 0): ByteBuffer => {
		if (size < 0) {
			throw new Error("Size value cannot be negative: got " + size + ".");
		}

		const data: Uint8Array = new Uint8Array(size);

		if (fillValue != 0) {
			data.fill(fillValue);
		}

		return new ByteBuffer(data);
	};

	public static readonly FROM_ARRAY: (array: ArrayLike<number>) => ByteBuffer = (array: ArrayLike<number>): ByteBuffer => {
		return new ByteBuffer(new Uint8Array(array));
	};

	public static readonly FROM_STRING: (string: string, textEncoding: TextEncoding) => ByteBuffer = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private readonly data: Uint8Array;
	private readonly viewSet: Set<ByteBuffer.View>;

	protected constructor(data: Uint8Array) {
		super(data.length);
		this.data = data;
		this.viewSet = new Set<ByteBuffer.View>();
	}

	public unsafeGetData(): Uint8Array {
		return this.data;
	}

	public get(index: number): number {
		if (index < 0 || index >= this.size) {
			throw new Error("Out of bounds access: got " + index + ".");
		}

		return this.data[index];
	}

	public set(index: number, value: number): void {
		if (index < 0 || index >= this.size) {
			throw new Error("Out of bounds access: got " + index + ".");
		}

		this.data[index] = value;
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

		const subBuffer: Uint8Array = this.data.subarray(start, end);
		const view: ByteBuffer.View = new ByteBuffer.View(subBuffer, this);
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
		return Array.from(this.data);
	}

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.data);
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

	public dispose(): void {
		for (const view of this.viewSet) {
			if (Disposable.isDisposed(view) == false) {
				view.dispose();
			}
		}
	}

}

namespace ByteBuffer {

	export class View extends ByteBuffer {

		private readonly parent: ByteBuffer;

		protected constructor(buffer: Uint8Array, parent: ByteBuffer) {
			super(buffer);
			this.parent = parent;
		}

		public getParent(): ByteBuffer {
			return this.parent;
		}

	}

}

export default ByteBuffer;
