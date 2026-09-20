//
// Decoder.ts
//

import ByteBuffer from "../memory/ByteBuffer.ts";

export default interface Decoder<T> {

	decode(source: ByteBuffer): T;

}
