//
// UnknownChunkDecoder.ts
//

import PNGChunk from "./PNGChunk.ts";
import PNGChunkDecoder from "./PNGChunkDecoder.ts";

export default class UnknownChunkDecoder extends PNGChunkDecoder<void> {

	public constructor(chunk: PNGChunk) {
		super(chunk, chunk.getSignature());
	}

	public override decode(): void {
		if (this.chunk.isCritical()) {
			throw new Error("Encountered unknown critical chunk: " + this.chunk.getSignatureAsString() + ".");
		}
	}

}
