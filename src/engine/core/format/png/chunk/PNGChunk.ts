//
// PNGChunk.ts
//

import Endian from "../../../memory/Endian.ts";
import ByteBuffer from "../../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../../io/ByteBufferReader.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class PNGChunk {

	public static readonly READ_FROM: (reader: ByteBufferReader) => PNGChunk = (reader: ByteBufferReader): PNGChunk => {
		const size: number = reader.readUint32(null, Endian.BIG);
		const name: number = reader.readUint32(null, Endian.BIG);
		const data: ByteBuffer.View = reader.getBuffer().view(reader.getCursor(), reader.getCursor() + size);
		reader.skip(size);
		const crc: number = reader.readUint32();
		return new PNGChunk(size, name, data, crc);
	};

	public static readonly FROM_CHUNK_LIST: (chunkList: PNGChunk[]) => PNGChunk = (chunkList: PNGChunk[]): PNGChunk => {
		if (chunkList.length == 0) {
			throw new Error("Chunk list must contain at least one element.");
		}

		if (chunkList.length == 1) {
			return chunkList[0];
		}

		const signature: number = chunkList[0].getSignature();
		let resultSize: number = 0;
		for (let i: number = 0; i < chunkList.length; i++) {
			const chunk: PNGChunk = chunkList[i];

			if (signature != chunk.getSignature()) {
				throw new Error("Chunk list must contain chunks with homogeneous signature values.");
			}

			resultSize += chunk.getSize();
		}

		const destination: ByteBuffer = ByteBuffer.ALLOCATE(resultSize);
		let index: number = 0;
		for (let i: number = 0; i < chunkList.length; i++) {
			const chunk: PNGChunk = chunkList[i];
			const data: ByteBuffer = chunk.getData();
			const size: number = chunk.getSize();
			data.copyTo(destination, 0, size, index);
			index += size;
		}

		return new PNGChunk(resultSize, signature, destination, 0);
	};

	private static signatureToString(signature: number): string {
		const b0: number = signature & 0xFF;
		const b1: number = (signature >>> 8) & 0xFF;
		const b2: number = (signature >>> 16) & 0xFF;
		const b3: number = (signature >>> 24) & 0xFF;
		return String.fromCharCode(b3, b2, b1, b0);
	};

	private readonly size: number;
	private readonly signature: number;
	private readonly data: ByteBuffer;
	private readonly crc: number;
	private readonly signatureString: string;

	public constructor(size: number, signature: number, data: ByteBuffer, crc: number) {
		this.size = size;
		this.signature = signature;
		this.data = data;
		this.crc = crc;
		this.signatureString = PNGChunk.signatureToString(this.signature);
	}

	public getSize(): number {
		return this.size;
	}

	public getSignature(): number {
		return this.signature;
	}

	public getData(): ByteBuffer {
		return this.data;
	}

	public getCrc(): number {
		return this.crc;
	}

	public getSignatureAsString(): string {
		return this.signatureString;
	}

	public isCritical(): boolean {
		return ((this.signature >>> 24) & 0x20) == 0;
	}

	public equals(chunk: PNGChunk): boolean {
		return this === chunk || (this.size == chunk.size && this.signature == chunk.signature && this.crc == chunk.crc && this.data.equals(chunk.data));
	}

}
