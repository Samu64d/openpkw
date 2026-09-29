//
// ByteBuffer.ts
//

import Function from "../../common/Function.ts";
import BiFunction from "../../common/BiFunction.ts";
import TextEncoding from "../../codec/TextEncoding.ts";
import StringByteEncoder from "../../codec/StringByteEncoder.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

@Disposable()
class ByteBuffer extends BaseByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: Function<number, ByteBuffer> = (capacity: number): ByteBuffer => {
		const uint8Array: Uint8Array = ByteBuffer.allocateUint8Array(capacity);

		return new ByteBuffer(uint8Array, capacity, false);
	};

	public static readonly FROM_ARRAY: Function<ArrayLike<number>, ByteBuffer> = (array: ArrayLike<number>): ByteBuffer => {
		const uint8Array: Uint8Array = ByteBuffer.allocateUint8Array(array.length, 0);
		uint8Array.set(array);

		return new ByteBuffer(uint8Array, array.length, false);
	};

	public static readonly FROM_STRING: BiFunction<string, TextEncoding, ByteBuffer> = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private readonly viewSet: Set<ByteBuffer.View>;

	public constructor(data: Uint8Array, capacity: number, readonly: boolean) {
		super(data, capacity, readonly);

		this.viewSet = new Set<ByteBuffer.View>();
	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		return this.data[position];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		this.data[position] = value;
	}

	public setArray(data: ArrayLike<number>, start: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(start, data.length) == false) {
			throw new Error("Out of bounds access.");
		}

		this.data.set(data, start);
	}

	public override view(start: number = 0, end: number = this.capacity): ByteBuffer.View {
		if (this.isRangeWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		const view: ByteBuffer.View = new ByteBuffer.View(this, start, end);

		this.viewSet.add(view);
		return view;
	}

	public override copyTo(byteBuffer: ByteBuffer, sourceStart: number = 0, sourceEnd: number = this.capacity, destinationStart: number = 0): void {
		const length: number = sourceEnd - sourceStart;
		if (this.isRangeWithinBounds(sourceStart, length) == false || byteBuffer.isRangeWithinBounds(destinationStart, length) == false) {
			throw new Error("Out of bounds access.");
		}

		byteBuffer.data.set(this.data.subarray(sourceStart, sourceEnd), destinationStart);
	}

	public asReadonly(): ByteBuffer {
		const data: Uint8Array = this.data.subarray(0, this.capacity);

		Object.freeze(data);
		return new ByteBuffer(data, this.capacity, true);
	}

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.data.subarray(0, this.capacity));
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
			super(source.unsafeGetData().subarray(start, end), end - start, false);

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
