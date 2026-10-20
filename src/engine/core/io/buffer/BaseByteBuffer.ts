//
// BaseByteBuffer.ts
//

import Spannable from "../../memory/Spannable.ts";
import MemoryDriver from "../../interop/MemoryDriver.ts";
import DriverRegistry from "../../interop/DriverRegistry.ts";
import Buffer from "./Buffer.ts";

export default abstract class BaseByteBuffer extends Buffer {

	protected static allocateArrayBuffer(byteLength: number): ArrayBuffer {
		return DriverRegistry.get(MemoryDriver).allocateArrayBuffer(byteLength);
	};

	protected static freeArrayBuffer(arrayBuffer: ArrayBuffer): void {
		return DriverRegistry.get(MemoryDriver).freeArrayBuffer(arrayBuffer);
	}

	protected readonly readonly: boolean;

	protected constructor(capacity: number, readonly: boolean) {
		super(capacity, false);

		this.readonly = readonly;
	}

	public isReadonly(): boolean {
		return this.readonly;
	}

	public abstract unsafeGetSourceView(): Spannable;

	public abstract get(position: number): number;

	public abstract set(position: number, value: number): void;

	public abstract setArray(position: number, array: ArrayLike<number>): void;

	public abstract fill(value: number, startPosition: number, endPosition: number): void;

	public abstract copyTo(byteBuffer: BaseByteBuffer, sourceStartPosition: number, sourceEndPosition: number, destinationStartPosition: number): void;

	public abstract slice(startPosition: number, endPosition: number): BaseByteBuffer;

	public abstract toArray(startPosition: number, endPosition: number): number[];

}
