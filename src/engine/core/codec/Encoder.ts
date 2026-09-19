//
// Encoder.ts
//

import ByteBuffer from "../memory/ByteBuffer.ts";

export default interface Encoder<T> {

	encode(source: T): ByteBuffer;

}
