//
// MemoryDriver.ts
//

import Driver from "./Driver.ts";

export default abstract class MemoryDriver implements Driver {

	public abstract init(): void;

	public abstract allocateArrayBuffer(size: number): ArrayBuffer;

	public abstract freeArrayBuffer(arrayBuffer: ArrayBuffer): void;

	public abstract dispose(): void;

}
