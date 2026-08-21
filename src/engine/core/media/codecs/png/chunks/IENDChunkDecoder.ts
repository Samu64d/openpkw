//
// IENDChunkDecoder.ts
//

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IENDChunkDecoder extends PNGChunkDecoder {

	public static override readonly SIGNATURE: number = 0x49454E44;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
	}

}
