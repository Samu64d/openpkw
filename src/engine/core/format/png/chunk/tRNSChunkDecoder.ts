//
// tRNSChunkDecoder.ts
//

import CodecException from "../../../exception/CodecException.ts";
import IHDRData from "../data/IHDRData.ts";
import tRNSData from "../data/tRNSData.ts";
import ColorType from "../image/ColorType.ts";
import Chunk from "./Chunk.ts";
import ChunkDecoder from "./ChunkDecoder.ts";

export default class tRNSChunkDecoder extends ChunkDecoder<tRNSData> {

	public static readonly CHUNK_SIGNATURE: number = 0x74524E53;

	private readonly colorType: ColorType;

	public constructor(chunk: Chunk, ihdrData: IHDRData) {
		super(chunk, tRNSChunkDecoder.CHUNK_SIGNATURE);

		this.colorType = ihdrData.getColorType();
	}

	public override decode(): tRNSData {
		const size: number = this.chunk.getSize();

		if (this.colorType == ColorType.GREYSCALE && size != 2) {
			throw new CodecException("tRNS chunk size must be 2 bytes for color type 0 but got " + size.toString());
		} else if (this.colorType == ColorType.TRUECOLOR && size != 6) {
			throw new CodecException("tRNS chunk size must be 6 bytes for color type 2 but got " + size.toString());
		}

		return new tRNSData(this.getChunkData().clone());
	}

}
