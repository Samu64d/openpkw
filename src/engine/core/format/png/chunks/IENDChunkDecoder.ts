//
// IENDChunkDecoder.ts
//

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IENDChunkDecoder extends PNGChunkDecoder<void> {

	public static override readonly CHUNK_SIGNATURE: number = 0x49454E44;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
	}

}
