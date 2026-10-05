//
// Encoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default interface Encoder<T> {

	encode(source: T): BaseByteBuffer;

}
