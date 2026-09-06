//
// Decoder.ts
//

import ByteBuffer from "../memory/ByteBuffer.ts";

export default abstract class Decoder<T> {

	protected readonly source: ByteBuffer;

	public constructor(source: ByteBuffer) {
		this.source = source;
	}

	public getSource(): ByteBuffer {
		return this.source;
	}

	public abstract decode(): T;

}
