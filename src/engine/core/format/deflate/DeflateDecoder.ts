//
// DeflateDecoder.ts
//

import NodeZlib from "node:zlib";

import ByteBuffer from "../../memory/ByteBuffer.ts";
import Decoder from "../Decoder.ts";

export default class DeflateDecoder extends Decoder<ByteBuffer> {

	public constructor(source: ByteBuffer) {
		super(source);
	}

	public override decode(): ByteBuffer {
		return new ByteBuffer(NodeZlib.inflateSync(this.source.unsafeGetData()));
	}

}
