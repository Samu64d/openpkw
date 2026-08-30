//
// IDATChunkDecoder.ts
//

import Zlib from "node:zlib";

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IDATChunkDecoder extends PNGChunkDecoder {

	public static override readonly SIGNATURE: number = 0x49444154;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
		const data: Uint8Array = this.getChunk().getData().unsafeGetData();
		const v: Uint8Array = Zlib.deflateSync(data);
	
	}

}
