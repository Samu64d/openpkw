//
// PNGDecoder.ts
//

import Nullable from "../../common/Nullable.ts";
import Endian from "../../memory/Endian.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../memory/ByteBufferReader.ts";
import Image from "../../resource/Image.ts";
import Decoder from "../Decoder.ts";
import IHDRData from "./data/IHDRData.ts";
import IDATData from "./data/IDATData.ts";
import IENDChunkDecoder from "./chunks/IENDChunkDecoder.ts";
import IHDRChunkDecoder from "./chunks/IHDRChunkDecoder.ts";
import IDATChunkDecoder from "./chunks/IDATChunkDecoder.ts";
import PNGChunk from "./PNGChunk.ts";

export default class PNGDecoder extends Decoder<Image> {

	private static readonly HEADER_SIZE: number = 8;
	private static readonly HEADER_SIGNATURE: ByteBuffer = ByteBuffer.FROM_ARRAY([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
	private static readonly CHUNK_REGION_OFFSET: number = 8;

	private readonly reader: ByteBufferReader;
	private readonly chunkList: PNGChunk[];
	private ihdrData: Nullable<IHDRData>;
	private idatData: Nullable<IDATData>;

	public constructor(source: ByteBuffer) {
		super(source);
		this.reader = new ByteBufferReader(source);
		this.chunkList = new Array<PNGChunk>();
		this.ihdrData = null;
		this.idatData = null;
	}

	public override decode(): Image {
		this.validateHeader();
		this.collectChunkList();
		this.parseChunkList();

		if (this.ihdrData != null && this.idatData != null) {
			return new Image(this.ihdrData.getWidth(), this.ihdrData.getHeight(), this.idatData.getImageData());
		} else {
			throw new Error("Cannot retrive all critical chunks.");
		}
	}

	private validateHeader(): void {
		const headerValue: ByteBuffer.View = this.source.view(0, PNGDecoder.HEADER_SIZE);
		if (headerValue.equals(PNGDecoder.HEADER_SIGNATURE) == false) {
			throw new Error("Invalid PNG file header.");
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

			if (name == IENDChunkDecoder.CHUNK_SIGNATURE) {
				break;
			}
		}
	}

	private parseChunk(chunk: PNGChunk): void {
		switch (chunk.getSignature()) {

			case IHDRChunkDecoder.CHUNK_SIGNATURE:
				{
					const chunkDecorder: IHDRChunkDecoder = new IHDRChunkDecoder(chunk);
					this.ihdrData = chunkDecorder.decode();
				}
				break;

			case IDATChunkDecoder.CHUNK_SIGNATURE:
				{
					if (this.ihdrData != null) {
						const chunkDecorder: IDATChunkDecoder = new IDATChunkDecoder(chunk, this.ihdrData);
						this.idatData = chunkDecorder.decode();
					}
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
