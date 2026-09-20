//
// DeflateDecoder.ts
//

import NodeZlib from "node:zlib";

import ByteBuffer from "../../memory/ByteBuffer.ts";
import SingleValueDecoder from "../../codec/SingleValueDecoder.ts";

export default class DeflateDecoder extends SingleValueDecoder<ByteBuffer> {

	public constructor(source: ByteBuffer) {
		super(source);
	}

	public override decode(): ByteBuffer {
		const src: Uint8Array = this.source.unsafeGetData();
		return ByteBuffer.FROM_ARRAY(NodeZlib.inflateSync(src));
	}

}
