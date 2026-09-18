//
// ByteBuffer.ts
//

import Disposable from "../reflection/decorators/Disposable.ts";
import TextEncoding from "./TextEncoding.ts";
import StringByteEncoder from "./StringByteEncoder.ts";

@Disposable()
class ByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: (size: number, fillValue?: number) => ByteBuffer = (size: number, fillValue: number = 0): ByteBuffer => {
		if (size < 1) {
			throw new Error("Size value must be at least 1.");
		}

		const data: Uint8Array = new Uint8Array(size);
		if (fillValue != 0) {
			data.fill(fillValue);
		}
		return new ByteBuffer(data);
	};

	public static readonly FROM_ARRAY: (array: number[]) => ByteBuffer = (array: number[]): ByteBuffer => {
		return new ByteBuffer(new Uint8Array(array));
	};

	public static readonly FROM_STRING: (string: string, textEncoding: TextEncoding) => ByteBuffer = (string: string, textEncoding: TextEncoding): ByteBuffer => {
		return new StringByteEncoder(string).encode(textEncoding);
	};

	private readonly data: Uint8Array;
	private readonly viewSet: Set<ByteBuffer.View>;

	public constructor(data: Uint8Array) {
		this.data = data;
		this.viewSet = new Set<ByteBuffer.View>();
	}

	public unsafeGetData(): Uint8Array {
		return this.data;
	}

	public getSize(): number {
		return this.data.length;
	}

	public isWithinBounds(position: number, length: number): boolean {
		return position >= 0 && length >= 0 && position <= this.data.length - length;
	}

	public get(index: number): number {
		if (index < 0 || index >= this.data.length) {
			throw new Error("Out of bounds access.");
		}

		return this.data[index];
	}

	public set(index: number, value: number): void {
		if (index < 0 || index >= this.data.length) {
			throw new Error("Out of bounds access.");
		}

		this.data[index] = value;
	}

	public setArray(data: number[], start: number,): void {
		if (this.isWithinBounds(start, data.length) == false) {
			throw new Error("Out of bounds access.");
		}

		this.data.set(data, start);
	}

	public fill(fillValue: number, start: number = 0, end: number = this.data.length): void {
		this.data.fill(fillValue, start, end);
	}

	public view(start: number = 0, end: number = this.data.length): ByteBuffer.View {
		if (this.isWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		const subBuffer: Uint8Array = this.data.subarray(start, end);
		const view: ByteBuffer.View = new ByteBuffer.View(subBuffer, this);
		this.viewSet.add(view);
		return view;
	}

	public copyTo(byteBuffer: ByteBuffer, sourceStart: number = 0, sourceEnd: number = this.data.length, destinationStart: number = 0): void {
		const length: number = sourceEnd - sourceStart;
		if (this.isWithinBounds(sourceStart, length) == false || byteBuffer.isWithinBounds(destinationStart, length) == false) {
			throw new Error("Out of bounds access.");
		}

		byteBuffer.data.set(this.data.subarray(sourceStart, sourceEnd), destinationStart);
	}

	public toArray(): number[] {
		return Array.from(this.data);
	}

	public clone(): ByteBuffer {
		const data: Uint8Array = new Uint8Array(this.data);
		return new ByteBuffer(data);
	}

	public equals(byteBuffer: ByteBuffer): boolean {
		if (this === byteBuffer) {
			return true;
		}

		if (this.data.length != byteBuffer.data.length) {
			return false;
		}

		for (let i: number = 0; i < this.data.length; i++) {
			if (this.data[i] != byteBuffer.data[i]) {
				return false;
			}
		}
		return true;
	}

	public dispose(): void {
		for (const view of this.viewSet) {
			view.dispose();
		}
	}

	public disposeView(view: ByteBuffer.View): void {
		this.viewSet.delete(view);
	}

}

namespace ByteBuffer {

	export class View extends ByteBuffer {

		private readonly parent: ByteBuffer;

		public constructor(buffer: Uint8Array, parent: ByteBuffer) {
			super(buffer);
			this.parent = parent;
		}

		public getParent(): ByteBuffer {
			return this.parent;
		}

		public override dispose(): void {
			this.parent.disposeView(this);
			super.dispose();
		}

	}

}

export default ByteBuffer;
