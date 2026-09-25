//
// ChunkDecoder.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Chunk from "./Chunk.ts";

export default abstract class ChunkDecoder<T> {

	private static readonly MAX_CHUNK_SIZE: number = 0x7FFFFFFF;

	protected readonly chunk: Chunk;

	public constructor(chunk: Chunk, expectedSignature: number, expectedMinSize: number = 0, expectedMaxSize: number = ChunkDecoder.MAX_CHUNK_SIZE) {
		if (chunk.getSignature() != expectedSignature) {
			throw new Error("Chunk signature is incorrect: expected " + expectedSignature + ", got " + chunk.getSignature() + ".)");
		}
		const size: number = chunk.getSize();
		if (size < expectedMinSize || size > expectedMaxSize) {
			throw new Error(chunk.getSignatureAsString() + " chunk size must be between " + expectedMinSize + " and " + expectedMaxSize + " bytes: got " + size + ".");
		}

		this.chunk = chunk;
	}

	public getChunk(): Chunk {
		return this.chunk;
	}

	public getChunkData(): ByteBuffer {
		return this.chunk.getData();
	}

	public abstract decode(): T;

}
