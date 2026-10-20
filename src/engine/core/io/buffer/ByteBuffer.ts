//
// ByteBuffer.ts
//

import Function from "../../common/Function.ts";
import BiFunction from "../../common/BiFunction.ts";
import Spannable from "../../memory/Spannable.ts";
import TextEncoding from "../../codec/TextEncoding.ts";
import StringByteEncoder from "../../codec/StringByteEncoder.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import InvalidOperationException from "../../exception/InvalidOperationException.ts";
import IOException from "../../exception/IOException.ts";
import BaseByteBuffer from "./BaseByteBuffer.ts";

@Disposable()
export default class ByteBuffer extends BaseByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: Function<number, ByteBuffer> = (capacity: number): ByteBuffer => {
		const arrayBuffer: ArrayBuffer = ByteBuffer.allocateArrayBuffer(capacity);

		return new ByteBuffer(arrayBuffer, 0, capacity, false, true);
	};

	public static readonly FROM_ARRAY: Function<ArrayLike<number>, ByteBuffer> = (array: ArrayLike<number>): ByteBuffer => {
		const arrayBuffer: ArrayBuffer = ByteBuffer.allocateArrayBuffer(array.length);
		const byteBuffer: ByteBuffer = new ByteBuffer(arrayBuffer, 0, array.length, false, true);

		byteBuffer.setArray(0, array);
		return byteBuffer;
	};

	public static readonly FROM_STRING: BiFunction<string, TextEncoding, ByteBuffer> = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(textEncoding).encode(string);
	};

	private readonly sourceBuffer: ArrayBuffer;
	private readonly sourceStartPosition: number;
	private readonly sourceArray: Uint8Array;
	private readonly owner: boolean;

	public constructor(source: ArrayBuffer, sourceStartPosition: number, sourceEndPosition: number, readonly: boolean, owner: boolean) {
		super(sourceEndPosition - sourceStartPosition, readonly);

		this.sourceBuffer = source;
		this.sourceStartPosition = sourceStartPosition;
		this.sourceArray = new Uint8Array(source).subarray(sourceStartPosition, sourceEndPosition);
		this.owner = owner;
	}

	public override unsafeGetSourceView(): Uint8Array {
		return this.sourceArray;
	}

	public override get(position: number): number {
		if (position < 0 || position >= this.capacity) {
			throw new IOException("Out of bounds access at " + position.toString());
		}

		return this.sourceArray[position];
	}

	public override set(position: number, value: number): void {
		if (this.isReadonly() == true) {
			throw new InvalidOperationException("Cannot set value: buffer is readonly");
		}
		if (position < 0 || position >= this.capacity) {
			throw new IOException("Out of bounds access at " + position.toString());
		}

		this.sourceArray[position] = value;
	}

	public override setArray(position: number, array: ArrayLike<number>): void {
		if (this.isReadonly() == true) {
			throw new InvalidOperationException("Cannot set value: buffer is readonly");
		}
		if (this.isRangeWithinBounds(position, position + array.length) == false) {
			throw new IOException("Out of bounds access");
		}

		this.sourceArray.set(array, position);
	}

	public override fill(fillValue: number, startPosition: number = 0, endPosition: number = this.capacity): void {
		if (this.isReadonly() == true) {
			throw new InvalidOperationException("Cannot set value: buffer is readonly");
		}
		if (this.isRangeWithinBounds(startPosition, endPosition) == false) {
			throw new IOException("Out of bounds access");
		}

		this.sourceArray.fill(fillValue, startPosition, endPosition);
	}

	public override copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number = 0, sourceEndPosition: number = this.capacity, destinationStartPosition: number = 0): void {
		if (this.isRangeWithinBounds(sourceStartPosition, sourceEndPosition) == false) {
			throw new IOException("Out of bounds access");
		}
		if (byteBuffer.isRangeWithinBounds(destinationStartPosition, destinationStartPosition + (sourceEndPosition - sourceStartPosition)) == false) {
			throw new IOException("Out of bounds access");
		}

		Spannable.copyTo(this.sourceArray, byteBuffer.unsafeGetSourceView(), sourceStartPosition, sourceEndPosition, destinationStartPosition);
	}

	public override slice(startPosition: number = 0, endPosition: number = this.capacity): ByteBuffer {
		if (this.isRangeWithinBounds(startPosition, endPosition) == false) {
			throw new IOException("Out of bounds access");
		}

		const sourceStartPosition: number = this.sourceStartPosition + startPosition;
		const sourceEndPosition: number = this.sourceStartPosition + endPosition;

		return new ByteBuffer(this.sourceBuffer, sourceStartPosition, sourceEndPosition, this.readonly, false);
	}

	public override toArray(startPosition: number = 0, endPosition: number = this.capacity): number[] {
		if (this.isRangeWithinBounds(startPosition, endPosition) == false) {
			throw new IOException("Out of bounds access");
		}

		const array: Uint8Array = this.sourceArray.subarray(startPosition, endPosition);

		return Array.from(array);
	}

	public asReadonly(): ByteBuffer {
		const sourceEndPosition: number = this.sourceStartPosition + this.capacity;

		return new ByteBuffer(this.sourceBuffer, this.sourceStartPosition, sourceEndPosition, true, false);
	}

	public clone(): ByteBuffer {
		const sourceBuffer: ArrayBuffer = ByteBuffer.allocateArrayBuffer(this.capacity);
		const sourceView: Uint8Array = new Uint8Array(sourceBuffer).subarray(0, this.capacity);

		Spannable.copyTo(this.sourceArray, sourceView);

		return new ByteBuffer(sourceBuffer, 0, this.capacity, this.readonly, true);
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
		if (this.owner == false) {
			return;
		}

		ByteBuffer.freeArrayBuffer(this.sourceBuffer);
	}

}
