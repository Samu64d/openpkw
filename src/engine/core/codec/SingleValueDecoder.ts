//
// SingleValueDecoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default abstract class SingleValueDecoder<T extends BaseByteBuffer, R> {

	protected readonly source: T;

	public constructor(source: T) {
		this.source = source;
	}

	public getSource(): T {
		return this.source;
	}

	public abstract decode(): R;

}
