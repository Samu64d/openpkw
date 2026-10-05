//
// Chunk.ts
//

import Function from "../../../common/Function.ts";
import ByteOrder from "../../../memory/ByteOrder.ts";
import ByteBuffer from "../../../io/buffer/ByteBuffer.ts";
import ByteBufferView from "../../../io/buffer/ByteBufferView.ts";
import ByteBufferReader from "../../../io/buffer/ByteBufferReader.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class Chunk {

	public static readonly READ_FROM: Function<ByteBufferReader, Chunk> = (reader: ByteBufferReader): Chunk => {
		const size: number = reader.readUint32(null, ByteOrder.BIG_ENDIAN);
		const name: number = reader.readUint32(null, ByteOrder.BIG_ENDIAN);
		const data: ByteBufferView = reader.getBuffer().view(reader.getPosition(), reader.getPosition() + size);
		reader.skip(size);
		const crc: number = reader.readUint32();

		return new Chunk(size, name, data, crc);
	};

	public static readonly FROM_CHUNK_LIST: Function<Chunk[], Chunk> = (chunkList: Chunk[]): Chunk => {
		if (chunkList.length == 0) {
			throw new Error("Chunk list must contain at least one element.");
		}

		if (chunkList.length == 1) {
			return chunkList[0];
		}

		const signature: number = chunkList[0].getSignature();
		let resultSize: number = 0;

		for (let i: number = 0; i < chunkList.length; i++) {
			const chunk: Chunk = chunkList[i];

			if (signature != chunk.getSignature()) {
				throw new Error("Chunk list must contain chunks with homogeneous signature values.");
			}

			resultSize += chunk.getSize();
		}

		const destination: ByteBuffer = ByteBuffer.ALLOCATE(resultSize);
		let position: number = 0;

		for (let i: number = 0; i < chunkList.length; i++) {
			const chunk: Chunk = chunkList[i];
			const data: ByteBuffer = chunk.getData();
			const size: number = chunk.getSize();

			data.copyTo(destination, 0, size, position);
			position += size;
		}

		return new Chunk(resultSize, signature, destination, 0);
	};

	private static signatureToString(signature: number): string {
		const b0: number = signature & 0xFF;
		const b1: number = (signature >>> 8) & 0xFF;
		const b2: number = (signature >>> 16) & 0xFF;
		const b3: number = (signature >>> 24) & 0xFF;

		return String.fromCharCode(b3, b2, b1, b0);
	}

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
		this.signatureString = Chunk.signatureToString(this.signature);
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

	public equals(chunk: Chunk): boolean {
		return this === chunk || (this.size == chunk.size && this.signature == chunk.signature && this.crc == chunk.crc && this.data.equals(chunk.data));
	}

}
