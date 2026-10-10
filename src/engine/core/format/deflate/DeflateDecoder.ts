//
// DeflateDecoder.ts
//

import NodeZlib from "node:zlib";

import Spannable from "../../memory/Spannable.ts";
import ByteBuffer from "../../io/buffer/ByteBuffer.ts";
import SingleValueDecoder from "../../codec/SingleValueDecoder.ts";

export default class DeflateDecoder extends SingleValueDecoder<ByteBuffer> {

	public constructor(source: ByteBuffer) {
		super(source);
	}

	public override decode(): ByteBuffer {
		const src: Spannable = this.source.unsafeGetSourceView();

		return ByteBuffer.FROM_ARRAY(NodeZlib.inflateSync(src));
	}

}
