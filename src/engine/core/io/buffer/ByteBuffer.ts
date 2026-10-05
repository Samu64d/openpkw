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
export default class ByteBuffer extends BaseByteBuffer implements Disposable.Target {

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

	private readonly source: Uint8Array;

	public constructor(source: Uint8Array, capacity: number, readonly: boolean) {
		super(capacity, readonly);

		this.source = source;
	}

	public override unsafeGetSource(): Uint8Array {
		return this.source.subarray(0, this.capacity);
	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		return this.source[position];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		this.source[position] = value;
	}

	public override fill(fillValue: number, startPosition: number = 0, endPosition: number = this.capacity): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		this.source.fill(fillValue, startPosition, endPosition);
	}

	public override copyTo(byteBuffer: ByteBuffer, sourceStartPosition: number = 0, sourceEndPosition: number = this.capacity, destinationStartPosition: number = 0): void {
		const length: number = sourceEndPosition - sourceStartPosition;
		if (this.isRangeWithinBounds(sourceStartPosition, length) == false || byteBuffer.isRangeWithinBounds(destinationStartPosition, length) == false) {
			throw new Error("Out of bounds access.");
		}

		byteBuffer.source.set(this.source.subarray(sourceStartPosition, sourceEndPosition), destinationStartPosition);
	}

	public override toArray(startPosition: number = 0, endPosition: number = this.capacity): number[] {
		if (this.isRangeWithinBounds(startPosition, endPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		return Array.from(this.source.subarray(startPosition, endPosition));
	}

	public override setArray(array: ArrayLike<number>, startPosition: number = 0): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, array.length) == false) {
			throw new Error("Out of bounds access.");
		}

		this.source.set(array, startPosition);
	}

	public override view(startPosition: number = 0, endPosition: number = this.capacity): ByteBufferView {
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		const view: ByteBufferView = new ByteBufferView(this, startPosition, endPosition);

		this.viewSet.add(view);
		return view;
	}

	public override equals(byteBuffer: ByteBuffer): boolean {
		if (this === byteBuffer) {
			return true;
		}

		if (this.capacity != byteBuffer.capacity) {
			return false;
		}

		for (let i: number = 0; i < this.capacity; i++) {
			if (this.source[i] != byteBuffer.source[i]) {
				return false;
			}
		}

		return true;
	}

	public asReadonly(): ByteBuffer {
		const source: Uint8Array = this.source.subarray(0, this.capacity);

		Object.freeze(source);
		return new ByteBuffer(source, this.capacity, true);
	}

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_ARRAY(this.source.subarray(0, this.capacity));
	}

	public removeView(view: ByteBufferView): void {
		this.viewSet.delete(view);
	}

	public dispose(): void {
		for (const view of this.viewSet) {
			if (Disposable.isDisposed(view) == false) {
				view.dispose();
			}
		}

		if ((this instanceof ByteBufferView) == true) {
			return;
		}

		ByteBuffer.freeUint8Array(this.source);
	}

}

@Disposable()
export class ByteBufferView extends ByteBuffer implements Disposable.Target {

	private readonly parent: ByteBuffer;

	public constructor(source: ByteBuffer, start: number, end: number) {
		super(source.unsafeGetSource().subarray(start, end), end - start, false);

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
