//
// ChunkDecoder.ts
//

import ByteBuffer from "../../../io/buffer/ByteBuffer.ts";
import Exception from "../../../exception/Exception.ts";
import CodecException from "../../../exception/CodecException.ts";
import Chunk from "./Chunk.ts";

export default abstract class ChunkDecoder<T> {

	private static readonly MAX_CHUNK_SIZE: number = 0x7FFFFFFF;

	protected readonly chunk: Chunk;

	public constructor(chunk: Chunk, expectedSignature: number, expectedMinSize: number = 0, expectedMaxSize: number = ChunkDecoder.MAX_CHUNK_SIZE) {
		if (chunk.getSignature() != expectedSignature) {
			throw new Exception("Incorrect chunk signature: expected '" + Chunk.signatureToString(expectedSignature) + "' but got '" + chunk.getSignatureAsString() + "'");
		}

		const size: number = chunk.getSize();

		if (size < expectedMinSize || size > expectedMaxSize) {
			throw new CodecException(chunk.getSignatureAsString() + " chunk size must be between " + expectedMinSize.toString() + " and " + expectedMaxSize.toString() + " bytes but got " + size.toString());
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
