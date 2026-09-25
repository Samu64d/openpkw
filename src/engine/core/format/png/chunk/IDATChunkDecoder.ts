//
// IDATChunkDecoder.ts
//

import Nullable from "../../../common/Nullable.ts";
import ByteBuffer from "../../../memory/ByteBuffer.ts";
import ErrorInspect from "../../../reflection/error/ErrorInspect.ts";
import DeflateDecoder from "../../deflate/DeflateDecoder.ts";
import IHDRData from "../data/IHDRData.ts";
import IDATData from "../data/IDATData.ts";
import FilterDecoder from "../filter/FilterDecoder.ts";
import InterlaceMethod from "../interlace/InterlaceMethod.ts";
import InterlaceDecoder from "../interlace/InterlaceDecoder.ts";
import ColorType from "../image/ColorType.ts";
import Chunk from "./Chunk.ts";
import ChunkDecoder from "./ChunkDecoder.ts";

export default class IDATChunkDecoder extends ChunkDecoder<IDATData> {

	public static readonly CHUNK_SIGNATURE: number = 0x49444154;

	private readonly width: number;
	private readonly height: number;
	private readonly depth: number;
	private readonly colorType: ColorType;
	private readonly interlaceMethod: InterlaceMethod;

	public constructor(chunk: Chunk, ihdrData: IHDRData) {
		super(chunk, IDATChunkDecoder.CHUNK_SIGNATURE);
		this.width = ihdrData.getWidth();
		this.height = ihdrData.getHeight();
		this.depth = ihdrData.getDepth();
		this.colorType = ihdrData.getColorType();
		this.interlaceMethod = ihdrData.getInterlaceMethod();
	}

	public override decode(): IDATData {
		const source: ByteBuffer = this.getChunkData();
		const bitsPerPixel: number = ColorType.getChannelCount(this.colorType) * this.depth;
		let uncompressedData: Nullable<ByteBuffer> = null;

		try {
			uncompressedData = new DeflateDecoder(source).decode();
			let decodedData: ByteBuffer;

			if (this.interlaceMethod == InterlaceMethod.NONE) {
				const scanlineCount: number = this.height;
				const scanlineSize: number = Math.ceil((this.width * bitsPerPixel) / 8) + 1; // We add +1 for the filter type byte
				const scanlinePixelSize: number = Math.max(1, Math.ceil(bitsPerPixel / 8));

				decodedData = new FilterDecoder(uncompressedData, scanlineCount, scanlineSize, scanlinePixelSize).decode();
			} else {
				decodedData = new InterlaceDecoder(uncompressedData, this.width, this.height, bitsPerPixel).decode();
			}

			return new IDATData(decodedData);
		} catch (e: unknown) {
			throw new Error("Cannot decode IDAT data: " + (ErrorInspect.castToErrnoException(e) ? e.message : "Unknown error."));
		} finally {
			if (uncompressedData != null) {
				uncompressedData.dispose();
			}
		}
	}

}
