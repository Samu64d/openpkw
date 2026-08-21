//
// PNGDecoder.ts
//

import Endian from "../../../memory/Endian.ts";
import ByteBuffer from "../../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../../memory/ByteBufferReader.ts";
import Image from "../../../resource/resource/Image.ts";
import Decoder from "../../Decoder.ts";
import IHDRChunkDecoder from "./chunks/IHDRChunkDecoder.ts";
import IENDChunkDecoder from "./chunks/IENDChunkDecoder.ts";
import PNGChunk from "./PNGChunk.ts";
import IDATChunkDecoder from "./chunks/IDATChunkDecoder.ts";

export default class PNGDecoder implements Decoder<Image> {

	private static readonly HEADER_SIZE: number = 8;
	private static readonly HEADER_SIGNATURE: ByteBuffer = ByteBuffer.FROM_ARRAY([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
	private static readonly CHUNK_REGION_OFFSET: number = 8;

	private source: ByteBuffer;
	private reader: ByteBufferReader;
	private chunkList: PNGChunk[];

	public constructor(byteBuffer: ByteBuffer) {
		this.source = byteBuffer;
		this.reader = new ByteBufferReader(byteBuffer);
		this.chunkList = new Array<PNGChunk>();
	}

	public decode(): Image {
		this.validateHeader();
		this.collectChunkList();
		this.parseChunkList();
		return new Image(0, 0, 0, ByteBuffer.ALLOCATE(1024));
	}

	private validateHeader(): void {
		const headerValue: ByteBuffer.View = this.source.view(0, PNGDecoder.HEADER_SIZE);
		if (headerValue.equals(PNGDecoder.HEADER_SIGNATURE) == false) {
			throw new Error("Invalid png header.");
		}
	}

	private collectChunkList(): void {
		this.reader.seek(PNGDecoder.CHUNK_REGION_OFFSET);

		while (this.reader.isEof() == false) {

			const size: number = this.reader.readUint32(null, Endian.BIG);
			const name: number = this.reader.readUint32(null, Endian.BIG);
			const data: ByteBuffer.View = this.source.view(this.reader.getCursor(), this.reader.getCursor() + size);
			this.reader.skip(size);
			const crc: number = this.reader.readUint32();
			const chunk: PNGChunk = new PNGChunk(size, name, data, crc);
			this.chunkList.push(chunk);

			alert("Discovered chunk: " + chunk.getSignatureAsString())

			if (name == IENDChunkDecoder.SIGNATURE) {
				break;
			}
		}
	}

	private parseChunk(chunk: PNGChunk): void {
		switch (chunk.getSignature()) {
			case IHDRChunkDecoder.SIGNATURE:
				{
					const chunkDecorder: IHDRChunkDecoder = new IHDRChunkDecoder(chunk);
					chunkDecorder.decode();
				}
				break;
			case IDATChunkDecoder.SIGNATURE:
				{
					const chunkDecorder: IDATChunkDecoder = new IDATChunkDecoder(chunk);
					chunkDecorder.decode();
				}
				break;
		}
	}

	private parseChunkList(): void {
		for (const chunk of this.chunkList) {
			this.parseChunk(chunk);
		}
	}

}
