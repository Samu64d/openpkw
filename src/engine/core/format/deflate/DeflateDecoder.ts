//
// DeflateDecoder.ts
//

import NodeZlib from "node:zlib";

import ByteBuffer from "../../io/buffer/ByteBuffer.ts";
import SingleValueDecoder from "../../codec/SingleValueDecoder.ts";
import CodecException from "../../exception/CodecException.ts";

export default class DeflateDecoder extends SingleValueDecoder<ByteBuffer, ByteBuffer> {

	public constructor(source: ByteBuffer) {
		super(source);
	}

	public override decode(): ByteBuffer {
		try {
			const src: Uint8Array = this.source.unsafeGetSourceView();
			const resultArray: Uint8Array = NodeZlib.inflateSync(src);

			return ByteBuffer.FROM_ARRAY(resultArray);
		} catch (e: unknown) {
			throw new CodecException("Cannot deflate data", e);
		}

	}

}
