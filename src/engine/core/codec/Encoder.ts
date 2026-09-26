//
// Encoder.ts
//

import ByteBuffer from "../io/buffer/ByteBuffer.ts";

export default interface Encoder<T> {

	encode(source: T): ByteBuffer;

}
