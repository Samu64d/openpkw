//
// IENDChunkDecoder.ts
//

import Chunk from "./Chunk.ts";
import ChunkDecoder from "./ChunkDecoder.ts";

export default class IENDChunkDecoder extends ChunkDecoder<void> {

	public static readonly CHUNK_SIGNATURE: number = 0x49454E44;

	public constructor(chunk: Chunk) {
		super(chunk, IENDChunkDecoder.CHUNK_SIGNATURE, 0, 0);
	}

	public override decode(): void {
	}

}
