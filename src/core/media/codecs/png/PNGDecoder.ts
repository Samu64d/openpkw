//
// PNGDecoder.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../../memory/ByteBufferReader.ts";
import Image from "../../../resource/resources/Image.ts";
import Decoder from "../../Decoder.ts";
import PNGChunk from "./PNGChunk.ts";

export default class PNGDecoder implements Decoder<Image> {

	private static readonly HEADER_SIZE: number = 8;
	private static readonly HEADER_VALUE: ByteBuffer = ByteBuffer.FROM_ARRAY([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
	private static readonly IDAT_CHUNK_NAME: number = 0x49444154;
	private static readonly IEND_CHUNK_NAME: number = 0x49454E44;

	private source: ByteBuffer;
	private reader: ByteBufferReader;
	private chunkList: PNGChunk[];

	public constructor(source: ByteBuffer) {
		this.source = source;
		this.reader = new ByteBufferReader(source);
		this.chunkList = new Array<PNGChunk>();
	}

	public decode(): Image {
		this.validateHeader();
		this.reader.seek(PNGDecoder.HEADER_SIZE);
		this.collectChunks();
		this.parseChunks();
		return new Image(0, 0, 0, new ArrayBuffer(1));
	}

	private validateHeader(): void {
		const headerValue: ByteBuffer = this.source.subBuffer(0, PNGDecoder.HEADER_SIZE);
		if (!headerValue.equals(PNGDecoder.HEADER_VALUE)) {
			throw new Error("Invalid header");
		}
	}

	private collectChunks(): void {
		while (!this.reader.isEof()) {
			const size: number = this.reader.readUint32();
			const name: number = this.reader.readUint32();
			const data: ByteBuffer = this.source.subBuffer(this.reader.getCursor(), size);
			this.reader.skip(size);
			const crc: number = this.reader.readUint32();

			const chunk: PNGChunk = new PNGChunk(size, name, data, crc);
			this.chunkList.push(chunk);

			if (name == PNGDecoder.IEND_CHUNK_NAME) {
				break;
			}
		}
	}

	private parseChunk(chunk: PNGChunk): void {

		alert("Parsing chunk: " + chunk.getNameAsString() + " with size " + chunk.getSize());

		switch (name) {
			case PNGDecoder.IHDR_CHUNK_NAME:
				this.parseIHDR(size);
				break;

			case PNGDecoder.IDAT_CHUNK_NAME:
				this.parseIDAT(size);
				break;

			default:
				this.reader.skip(size);
				break;
		}
	}

	private parseChunks(): void {
		for (const chunk of this.chunkList) {
			this.parseChunk(chunk);
		}
	}

}
