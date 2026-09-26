//
// ByteBuffer.ts
//

import TextEncoding from "../../codec/TextEncoding.ts";
import StringByteEncoder from "../../codec/StringByteEncoder.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

@Disposable()
class ByteBuffer extends BaseByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: (size: number, fillValue?: number) => ByteBuffer = (size: number, fillValue: number = 0): ByteBuffer => {
		const uint8Array: Uint8Array = ByteBuffer.allocateUint8Array(size, fillValue);
		return new ByteBuffer(uint8Array, size);
	};

	public static readonly FROM_ARRAY: (array: ArrayLike<number>) => ByteBuffer = (array: ArrayLike<number>): ByteBuffer => {
		const uint8Array: Uint8Array = ByteBuffer.allocateUint8Array(array.length, 0);
		uint8Array.set(array);
		return new ByteBuffer(uint8Array, array.length);
	};

	public static readonly FROM_STRING: (string: string, textEncoding: TextEncoding) => ByteBuffer = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private readonly viewSet: Set<ByteBuffer.View>;

	public constructor(data: Uint8Array, size: number) {
		super(data, size);
		this.viewSet = new Set<ByteBuffer.View>();
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

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.data.subarray(0, this.size));
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
			ByteBuffer.freeUint8Array(this.data);
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
