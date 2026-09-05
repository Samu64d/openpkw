//
// DeflateDecoder.ts
//

import Zlib from "node:zlib";

import ByteBuffer from "../../memory/ByteBuffer.ts";
import Decoder from "../Decoder.ts";

export default class DeflateDecoder implements Decoder<ByteBuffer> {

	private source: ByteBuffer;

	public constructor(source: ByteBuffer) {
		this.source = source;
	}

	public decode(): ByteBuffer {
		const data: Uint8Array = this.source.unsafeGetData();
		return new ByteBuffer(Zlib.inflateSync(data));
	}

}
