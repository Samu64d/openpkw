//
// PNGDecoder.ts
//

import Nullable from "../../common/Nullable.ts";
import ByteBuffer from "../../memory/ByteBuffer.ts";
import ByteBufferReader from "../../memory/ByteBufferReader.ts";
import Image from "../../resource/Image.ts";
import Decoder from "../Decoder.ts";
import PNGChunk from "./chunk/PNGChunk.ts";
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

export default class PNGDecoder extends Decoder<Image> {

	private static readonly HEADER_SIZE: number = 8;

	private static readonly HEADER_SIGNATURE: ByteBuffer = ByteBuffer.FROM_ARRAY([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

	private static readonly CHUNK_REGION_OFFSET: number = 8;

	private ihdrChunk: Nullable<PNGChunk>;
	private plteChunk: Nullable<PNGChunk>;
	private trnsChunk: Nullable<PNGChunk>;
	private idatChunk: Nullable<PNGChunk>;
	private readonly unknownChunkList: PNGChunk[];
	private iendChunk: Nullable<PNGChunk>;
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
		this.unknownChunkList = new Array<PNGChunk>();
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
		const headerValue: ByteBuffer.View = this.source.view(0, PNGDecoder.HEADER_SIZE);
		if (headerValue.equals(PNGDecoder.HEADER_SIGNATURE) == false) {
			throw new Error("Invalid PNG file header.");
		}
	}

	private discoverChunks(): void {
		const reader: ByteBufferReader = new ByteBufferReader(this.source);
		reader.seek(PNGDecoder.CHUNK_REGION_OFFSET);

		const chunk: PNGChunk = PNGChunk.READ_FROM(reader);

		if (chunk.getSignature() != IHDRChunkDecoder.CHUNK_SIGNATURE) {
			throw new Error("First chunk must be IHDR: got " + chunk.getSignatureAsString() + ".");
		}

		this.ihdrChunk = chunk;

		let idatAccum: number = 0;
		const idatChunkList: PNGChunk[] = new Array<PNGChunk>();

		while (reader.isEof() == false) {
			const chunk: PNGChunk = PNGChunk.READ_FROM(reader);
			const signature: number = chunk.getSignature();

			if (signature == PLTEChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum != 0) {
					throw new Error("PLTE chunk must appear before IDAT chunks.");
				}

				this.plteChunk = chunk;
			} else if (signature == tRNSChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum != 0) {
					throw new Error("tRNS chunk must appear before IDAT chunks.");
				}

				this.trnsChunk = chunk;
			} else if (signature == IDATChunkDecoder.CHUNK_SIGNATURE) {
				if (idatAccum == -1) {
					throw new Error("Multiple IDAT chunks must be consecutive.");
				}

				idatChunkList.push(chunk);
				idatAccum++;
			} else if (chunk.getSignature() == IENDChunkDecoder.CHUNK_SIGNATURE) {
				if (reader.isEof() == false) {
					throw new Error("IEND chunk must be the final chunk in the stream.");
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

		this.idatChunk = PNGChunk.FROM_CHUNK_LIST(idatChunkList);
	}

	private decodeChunks(): void {
		if (this.ihdrChunk == null) {
			throw new Error("Missing IHDR chunk.");
		}
		if (this.idatChunk == null) {
			throw new Error("Missing IDAT chunk.");
		}
		if (this.iendChunk == null) {
			throw new Error("Missing IEND chunk.");
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
			throw new Error("Cannot retrieve all critical chunk data.");
		}

		const width: number = this.ihdrData.getWidth();
		const height: number = this.ihdrData.getHeight();
		const rgbaData: ByteBuffer = new PNGImage(this.ihdrData, this.idatData, this.plteData, this.trnsData).toRGBA8();
		return Image.FROM_RGBA(width, height, rgbaData);
	}

}
