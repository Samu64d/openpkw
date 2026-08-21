//
// PNGChunkDecoder.ts
//

import ByteBufferReader from "../../../memory/ByteBufferReader.ts";
import PNGChunk from "./PNGChunk.ts";

export default abstract class PNGChunkDecoder {

	public static readonly SIGNATURE: number;

	protected readonly reader: ByteBufferReader;
	private readonly chunk: PNGChunk;

	public constructor(chunk: PNGChunk) {
		this.chunk = chunk;
		this.reader = new ByteBufferReader(this.chunk.getData());
	}

	public getChunk(): PNGChunk {
		return this.chunk;
	}

	public abstract decode(): void;

}
