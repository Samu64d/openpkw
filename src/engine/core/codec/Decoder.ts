//
// Decoder.ts
//

import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";

export default interface Decoder<T> {

	decode(source: BaseByteBuffer): T;

}
