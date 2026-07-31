//
// ByteBuffer.ts
//

import Disposable from "../reflection/decorators/Disposable.ts";

@Disposable()
class ByteBuffer implements Disposable.Target {

	public static readonly ALLOCATE: (size: number, fillValue?: number) => ByteBuffer = (size: number, fillValue: number = 0): ByteBuffer => {
		if (size < 1) {
			throw new Error("Size value must be at least 1.");
		}
		const buffer = Buffer.alloc(size, fillValue);
		return new ByteBuffer(buffer);
	};

	public static readonly ALLOCATE_UNSAFE: (size: number) => ByteBuffer = (size: number): ByteBuffer => {
		if (size < 1) {
			throw new Error("Size value must be at least 1.");
		}
		const buffer = Buffer.allocUnsafe(size);
		return new ByteBuffer(buffer);
	};

	public static readonly FROM_SOURCE: (source: Buffer) => ByteBuffer = (source: Buffer): ByteBuffer => {
		const buffer: Buffer = Buffer.from(source);
		return new ByteBuffer(buffer);
	};

	public static readonly FROM_ARRAY: (array: number[]) => ByteBuffer = (array: number[]): ByteBuffer => {
		const buffer: Buffer = Buffer.from(array);
		return new ByteBuffer(buffer);
	};

	private readonly buffer: Buffer;
	private readonly viewSet: Set<ByteBuffer.View>;

	protected constructor(buffer: Buffer) {
		this.buffer = buffer;
		this.viewSet = new Set<ByteBuffer.View>();
	}

	public getSize(): number {
		return this.buffer.length;
	}

	public unsafeGetBuffer(): Buffer {
		return this.buffer;
	}

	public get(offset: number): number {
		if (!this.isInBounds(offset, 1)) {
			throw new Error("Out of bounds access.");
		}

		return this.buffer[offset];
	}

	public set(offset: number, value: number): void {
		if (!this.isInBounds(offset, 1)) {
			throw new Error("Out of bounds access.");
		}

		this.buffer[offset] = value;
	}

	public isInBounds(offset: number, length: number): boolean {
		return offset >= 0 && length >= 0 && offset <= this.getSize() - length;
	}

	public fill(value: number): void {
		this.buffer.fill(value);
	}

	public view(start: number, end: number): ByteBuffer.View {
		if (!this.isInBounds(start, end - start)) {
			throw new Error("Out of bounds access.");
		}

		const view: ByteBuffer.View = new ByteBuffer.View(this.buffer.subarray(start, end), this);
		this.viewSet.add(view);
		return view;
	}

	public subBuffer(start: number, end: number): ByteBuffer {
		if (!this.isInBounds(start, end - start)) {
			throw new Error("Out of bounds access.");
		}

		return ByteBuffer.FROM_SOURCE(this.buffer.subarray(start, end));
	}

	public subHead(end: number): ByteBuffer {
		return this.subBuffer(0, end);
	}

	public subTail(start: number): ByteBuffer {
		return this.subBuffer(start, this.buffer.length);
	}

	public copyTo(byteBuffer: ByteBuffer): void {
		if (byteBuffer.buffer.length < this.buffer.length) {
			throw new Error("Destination buffer size is too small.");
		}

		this.buffer.copy(byteBuffer.buffer);
	}

	public clone(): ByteBuffer {
		return ByteBuffer.FROM_SOURCE(this.buffer);
	}

	public equals(other: ByteBuffer): boolean {
		return this.buffer.equals(other.buffer);
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

		public constructor(buffer: Buffer, parent: ByteBuffer) {
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
