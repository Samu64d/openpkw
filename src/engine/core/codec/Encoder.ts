//
// Encoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default interface Encoder<T, R extends BaseByteBuffer> {

	encode(source: T): R;

}
