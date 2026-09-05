//
// PLTEChunkDecoder.ts
//

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class PLTEChunkDecoder extends PNGChunkDecoder<void> {

	public static override readonly CHUNK_SIGNATURE: number = 0x504C5445;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
	}

}
