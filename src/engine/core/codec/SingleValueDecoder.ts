//
// SingleValueDecoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default abstract class SingleValueDecoder<T> {

	protected readonly source: BaseByteBuffer;

	public constructor(source: BaseByteBuffer) {
		this.source = source;
	}

	public getSource(): BaseByteBuffer {
		return this.source;
	}

	public abstract decode(): T;

}
