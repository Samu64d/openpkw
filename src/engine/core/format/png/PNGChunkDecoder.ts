//
// PNGChunkDecoder.ts
//

import ByteBufferReader from "../../memory/ByteBufferReader.ts";
import PNGChunk from "./PNGChunk.ts";

export default abstract class PNGChunkDecoder<T> {

	public static readonly CHUNK_SIGNATURE: number;

	protected readonly reader: ByteBufferReader;
	protected readonly chunk: PNGChunk;

	public constructor(chunk: PNGChunk) {
		this.chunk = chunk;
		this.reader = new ByteBufferReader(this.chunk.getData());
	}

	public getChunk(): PNGChunk {
		return this.chunk;
	}

	public abstract decode(): T;

}
