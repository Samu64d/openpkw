//
// PNGDecoder.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteBuffer from "../../io/buffer/ByteBuffer.ts";
import ByteBufferReader from "../../io/buffer/ByteBufferReader.ts";
import SingleValueDecoder from "../../codec/SingleValueDecoder.ts";
import Image from "../../resource/Image.ts";
import CodecException from "../../exception/CodecException.ts";
import Chunk from "./chunk/Chunk.ts";
import IHDRChunkDecoder from "./chunk/IHDRChunkDecoder.ts";
import PLTEChunkDecoder from "./chunk/PLTEChunkDecoder.ts";
import tRNSChunkDecoder from "./chunk/tRNSChunkDecoder.ts";
import IDATChunkDecoder from "./chunk/IDATChunkDecoder.ts";
import UnknownChunkDecoder from "./chunk/UnknownChunkDecoder.ts";
import IENDChunkDecoder from "./chunk/IENDChunkDecoder.ts";
import IHDRData from "./data/IHDRData.ts";
import PLTEData from "./data/PLTEData.ts";
import tRNSData from "./data/tRNSData.ts";
import IDATData from "./data/IDATData.ts";
import PNGImage from "./image/PNGImage.ts";

export default class PNGDecoder extends SingleValueDecoder<ByteBuffer, Image> {

	private static readonly HEADER_SIZE: number = 8;

	private static readonly HEADER_SIGNATURE: number[] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

	private static readonly CHUNK_REGION_OFFSET: number = 8;

	private ihdrChunk: Nullable<Chunk>;
	private plteChunk: Nullable<Chunk>;
	private trnsChunk: Nullable<Chunk>;
	private idatChunk: Nullable<Chunk>;
	private readonly unknownChunkList: Chunk[];
	private iendChunk: Nullable<Chunk>;
	private ihdrData: Nullable<IHDRData>;
	private plteData: Nullable<PLTEData>;
	private trnsData: Nullable<tRNSData>;
	private idatData: Nullable<IDATData>;

	public constructor(source: ByteBuffer) {
		super(source);

		this.ihdrChunk = null;
		this.plteChunk = null;
		this.trnsChunk = null;
		this.idatChunk = null;
		this.unknownChunkList = new Array<Chunk>();
		this.iendChunk = null;
		this.ihdrData = null;
		this.plteData = null;
		this.trnsData = null;
		this.idatData = null;
	}

	public override decode(): Image {
		this.validateHeader();
		this.discoverChunks();
		this.decodeChunks();

		return this.composeImage();
	}

	private validateHeader(): void {
		const headerValue: ByteBuffer = this.source.slice(0, PNGDecoder.HEADER_SIZE);
		const headerSignature: ByteBuffer = ByteBuffer.FROM_ARRAY(PNGDecoder.HEADER_SIGNATURE);

		if (headerValue.equals(headerSignature) == false) {
			throw new CodecException("Invalid PNG file header");
		}
	}

	private discoverChunks(): void {
		const reader: ByteBufferReader<ByteBuffer> = new ByteBufferReader<ByteBuffer>(this.source);

		reader.seek(PNGDecoder.CHUNK_REGION_OFFSET);

		const chunk: Chunk = Chunk.FROM_READER(reader);

		if (chunk.getSignature() != IHDRChunkDecoder.CHUNK_SIGNATURE) {
			throw new CodecException("First chunk must be IHDR but got " + chunk.getSignatureAsString());
		}

		this.ihdrChunk = chunk;

		let idatAccum: number = 0;
		const idatChunkList: Chunk[] = new Array<Chunk>();

		while (reader.isEof() == false) {
			const chunk: Chunk = Chunk.FROM_READER(reader);
			const signature: number = chunk.getSignature();

			if (signature == PLTEChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum != 0) {
					throw new CodecException("PLTE chunk must appear before IDAT chunks");
				}

				this.plteChunk = chunk;
			} else if (signature == tRNSChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum != 0) {
					throw new CodecException("tRNS chunk must appear before IDAT chunks");
				}

				this.trnsChunk = chunk;
			} else if (signature == IDATChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum == -1) {
					throw new CodecException("Multiple IDAT chunks must be consecutive");
				}

				idatChunkList.push(chunk);
				idatAccum += 1;
			} else if (chunk.getSignature() == IENDChunkDecoder.CHUNK_SIGNATURE) {
				if (reader.isEof() == false) {
					throw new CodecException("IEND chunk must be the final chunk in the stream");
				}

				this.iendChunk = chunk;
			} else {
				if (idatAccum != 0) {
					idatAccum = -1;
				}
				this.unknownChunkList.push(chunk);
			}
		}

		reader.dispose();

		this.idatChunk = Chunk.FROM_CHUNK_LIST(idatChunkList);
	}

	private decodeChunks(): void {
		if (this.ihdrChunk == null) {
			throw new CodecException("Missing IHDR chunk");
		}
		if (this.idatChunk == null) {
			throw new CodecException("Missing IDAT chunk");
		}
		if (this.iendChunk == null) {
			throw new CodecException("Missing IEND chunk");
		}

		this.ihdrData = new IHDRChunkDecoder(this.ihdrChunk).decode();

		if (this.plteChunk != null) {
			this.plteData = new PLTEChunkDecoder(this.plteChunk).decode();
		}

		if (this.trnsChunk != null) {
			this.trnsData = new tRNSChunkDecoder(this.trnsChunk, this.ihdrData).decode();
		}

		this.idatData = new IDATChunkDecoder(this.idatChunk, this.ihdrData).decode();

		for (const chunk of this.unknownChunkList) {
			new UnknownChunkDecoder(chunk).decode();
		}

		new IENDChunkDecoder(this.iendChunk).decode();
	}

	private composeImage(): Image {
		if (this.ihdrData == null || this.idatData == null) {
			throw new CodecException("Some critical chunk were missing");
		}

		const width: number = this.ihdrData.getWidth();
		const height: number = this.ihdrData.getHeight();
		const rgbaData: ByteBuffer = new PNGImage(this.ihdrData, this.idatData, this.plteData, this.trnsData).toRGBA8();

		return new Image(width, height, rgbaData);
	}

}
