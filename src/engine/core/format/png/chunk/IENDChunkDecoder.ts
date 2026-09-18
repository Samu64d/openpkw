//
// IENDChunkDecoder.ts
//

import PNGChunk from "./PNGChunk.ts";
import PNGChunkDecoder from "./PNGChunkDecoder.ts";

export default class IENDChunkDecoder extends PNGChunkDecoder<void> {

	public static readonly CHUNK_SIGNATURE: number = 0x49454E44;

	public constructor(chunk: PNGChunk) {
		super(chunk, IENDChunkDecoder.CHUNK_SIGNATURE, 0, 0);
	}

	public override decode(): void {
	}

}
