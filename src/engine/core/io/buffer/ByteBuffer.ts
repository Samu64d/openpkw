//
// ByteBuffer.ts
//

import Function from "../../common/Function.ts";
import BiFunction from "../../common/BiFunction.ts";
import Spannable from "../../memory/Spannable.ts";
import TextEncoding from "../../codec/TextEncoding.ts";
import StringByteEncoder from "../../codec/StringByteEncoder.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

@Disposable()
export default class ByteBuffer extends BaseByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: Function<number, ByteBuffer> = (capacity: number): ByteBuffer => {
		const arrayBuffer: ArrayBuffer = ByteBuffer.allocateArrayBuffer(capacity);

		return new ByteBuffer(arrayBuffer, 0, capacity, false);
	};

	public static readonly FROM_ARRAY: Function<ArrayLike<number>, ByteBuffer> = (array: ArrayLike<number>): ByteBuffer => {
		const arrayBuffer: ArrayBuffer = ByteBuffer.allocateArrayBuffer(array.length);
		const byteBuffer: ByteBuffer = new ByteBuffer(arrayBuffer, 0, array.length, false);

		byteBuffer.setArray(array);
		return byteBuffer;
	};

	public static readonly FROM_STRING: BiFunction<string, TextEncoding, ByteBuffer> = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private readonly sourceBuffer: ArrayBuffer;
	private readonly sourceArray: Uint8Array;

	public constructor(source: ArrayBuffer, sourceStartPosition: number, sourceEndPosition: number, readonly: boolean) {
		super(sourceEndPosition - sourceStartPosition, readonly);

		this.sourceBuffer = source;
		this.sourceArray = new Uint8Array(source).subarray(sourceStartPosition, sourceEndPosition);
	}

	public override unsafeGetSource(): Uint8Array {
		return this.sourceArray;
	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		return this.sourceArray[position];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (position < 0 || position >= this.capacity) {
			throw new Error("Out of bounds access: got " + position + ".");
		}

		this.sourceArray[position] = value;
	}

	public override setArray(array: ArrayLike<number>, startPosition: number = 0): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, array.length) == false) {
			throw new Error("Out of bounds access.");
		}

		this.sourceArray.set(array, startPosition);
	}

	public override fill(fillValue: number, startPosition: number = 0, endPosition: number = this.capacity): void {
		if (this.isReadonly() == true) {
			throw new Error("Cannot set value: buffer is readonly.");
		}
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		this.sourceArray.fill(fillValue, startPosition, endPosition);
	}

	public override copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number = 0, sourceEndPosition: number = this.capacity, destinationStartPosition: number = 0): void {
		const length: number = sourceEndPosition - sourceStartPosition;

		if (this.isRangeWithinBounds(sourceStartPosition, length) == false || byteBuffer.isRangeWithinBounds(destinationStartPosition, length) == false) {
			throw new Error("Out of bounds access.");
		}

		Spannable.memcopyUint8Array(this.sourceArray, byteBuffer.unsafeGetSource(), sourceStartPosition, sourceEndPosition, destinationStartPosition);
	}

	public override slice(startPosition: number = 0, endPosition: number = this.capacity): ByteBuffer {
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		const sourceStartPosition: number = this.sourceArray.byteOffset + startPosition;
		const sourceEndPosition: number = this.sourceArray.byteOffset + endPosition;

		return new ByteBuffer(this.sourceBuffer, sourceStartPosition, sourceEndPosition, this.readonly);
	}

	public override toArray(startPosition: number = 0, endPosition: number = this.capacity): number[] {
		if (this.isRangeWithinBounds(startPosition, endPosition - startPosition) == false) {
			throw new Error("Out of bounds access.");
		}

		const array: Uint8Array = this.sourceArray.subarray(startPosition, endPosition);

		return Array.from(array);
	}

	public asReadonly(): ByteBuffer {
		const sourceStartPosition: number = this.sourceArray.byteOffset;
		const sourceEndPosition: number = this.sourceArray.byteOffset + this.capacity;

		return new ByteBuffer(this.sourceBuffer, sourceStartPosition, sourceEndPosition, true);
	}

	public clone(): ByteBuffer {
		const sourceStartPosition: number = this.sourceArray.byteOffset;
		const sourceEndPosition: number = this.sourceArray.byteOffset + this.capacity;
		const arrayBuffer: ArrayBuffer = this.sourceBuffer.slice(); //TODO: malloc

		return new ByteBuffer(arrayBuffer, sourceStartPosition, sourceEndPosition, this.readonly);
	}

	public equals(byteBuffer: ByteBuffer): boolean {
		if (this === byteBuffer) {
			return true;
		}

		if (this.capacity != byteBuffer.capacity) {
			return false;
		}

		for (let i: number = 0; i < this.capacity; i++) {
			if (this.sourceArray[i] != byteBuffer.sourceArray[i]) {
				return false;
			}
		}

		return true;
	}

	public dispose(): void {
		//ByteBuffer.freeArrayBuffer(this.sourceBuffer);
	}

}
