//
// UnknownChunkDecoder.ts
//

import Exception from "../../../exception/Exception.ts";
import Chunk from "./Chunk.ts";
import ChunkDecoder from "./ChunkDecoder.ts";

export default class UnknownChunkDecoder extends ChunkDecoder<void> {

	public constructor(chunk: Chunk) {
		super(chunk, chunk.getSignature());
	}

	public override decode(): void {
		if (this.chunk.isCritical() == true) {
			throw new Exception("Encountered unknown critical chunk: " + this.chunk.getSignatureAsString());
		}
	}

}
