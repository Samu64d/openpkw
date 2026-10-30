//
// PoolMemoryDriver.ts
//

import Nullable from "../../../core/common/Nullable.ts";
import SizeablePoolAllocator from "../../../core/memory/SizeablePoolAllocator.ts";
import MemoryDriver from "../../../core/interop/MemoryDriver.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import Exception from "../../../core/exception/Exception.ts";
import ArgumentOutOfRangeException from "../../../core/exception/ArgumentOutOfRangeException.ts";

@Disposable()
export default class BrowserMemoryDriver extends MemoryDriver implements Disposable.Target {

	private readonly allocator: SizeablePoolAllocator<ArrayBuffer>;

	public constructor() {
		super();

		this.allocator = new SizeablePoolAllocator<ArrayBuffer>(SizeablePoolAllocator.createItemFactory(ArrayBuffer));
	}

	public override init(): void {
	}

	public override allocateArrayBuffer(byteLength: number): ArrayBuffer {
		ArgumentOutOfRangeException.throwIfLessThan(byteLength, 0, "byteLength");

		const arrayBuffer: Nullable<ArrayBuffer> = this.allocator.malloc(byteLength);

		if (arrayBuffer == null) {
			throw new Exception("Cannot allocate a new array buffer of byte length: " + byteLength.toString());
		}

		return arrayBuffer;
	}

	public override freeArrayBuffer(arrayBuffer: ArrayBuffer): void {
		this.allocator.free(arrayBuffer);
	}

	public dispose(): void {
	}

}
