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
		data.fill(fillValue);
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
		return position >= 0 && length >= 0 && position <= this.getSize() - length;
	}

	public get(index: number): number {
		if (index >= this.data.length) {
			throw new Error("Out of bounds access.");
		}
		return this.data[index];
	}

	public set(index: number, value: number): number {
		return this.data[index] = value;
	}

	public fill(fillValue: number): void {
		this.data.fill(fillValue);
	}

	public view(start: number, end: number): ByteBuffer.View {
		if (this.isWithinBounds(start, end - start) == false) {
			throw new Error("Out of bounds access.");
		}

		const subBuffer: Uint8Array = this.data.subarray(start, end);
		const view: ByteBuffer.View = new ByteBuffer.View(subBuffer, this);
		this.viewSet.add(view);
		return view;
	}

	public copyTo(byteBuffer: ByteBuffer): void {
		if (byteBuffer.getSize() < this.getSize()) {
			throw new Error("Destination buffer size is too small.");
		}

		for (let i = 0; i < this.data.length; i++) {
			byteBuffer.data[i] = this.data[i];
		}
	}

	public clone(): ByteBuffer {
		const buffer: Uint8Array = new Uint8Array(this.data);
		return new ByteBuffer(buffer);
	}

	public equals(byteBuffer: ByteBuffer): boolean {
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
