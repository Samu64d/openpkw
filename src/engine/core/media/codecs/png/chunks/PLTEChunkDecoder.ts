//
// PLTEChunkDecoder.ts
//

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class PLTEChunkDecoder extends PNGChunkDecoder {

	public static override readonly SIGNATURE: number = 0x504C5445;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
	}

}
