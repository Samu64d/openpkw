//
// Decoder.ts
//

import ByteBuffer from "../io/buffer/ByteBuffer.ts";

export default interface Decoder<T> {

	decode(source: ByteBuffer): T;

}
