//
// Decoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default interface Decoder<T extends BaseByteBuffer, R> {

	decode(source: T): R;

}
