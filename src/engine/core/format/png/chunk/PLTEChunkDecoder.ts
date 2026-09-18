//
// PLTEChunkDecoder.ts
//

import PLTEData from "../data/PLTEData.ts";
import PNGChunk from "./PNGChunk.ts";
import PNGChunkDecoder from "./PNGChunkDecoder.ts";

export default class PLTEChunkDecoder extends PNGChunkDecoder<PLTEData> {

	public static readonly CHUNK_SIGNATURE: number = 0x504C5445;

	public constructor(chunk: PNGChunk) {
		super(chunk, PLTEChunkDecoder.CHUNK_SIGNATURE, 3, 768);
	}

	public override decode(): PLTEData {
		const size: number = this.chunk.getSize();

		if (size % 3 != 0) {
			throw new Error("PLTE chunk size must be a multiple of 3: got " + size + ".");
		}

		return new PLTEData(this.getChunkData().clone());
	}

}
