//
// tRNSChunkDecoder.ts
//

import IHDRData from "../data/IHDRData.ts";
import tRNSData from "../data/tRNSData.ts";
import ColorType from "../image/ColorType.ts";
import PNGChunk from "./PNGChunk.ts";
import PNGChunkDecoder from "./PNGChunkDecoder.ts";

export default class tRNSChunkDecoder extends PNGChunkDecoder<tRNSData> {

	public static readonly CHUNK_SIGNATURE: number = 0x74524E53;

	private readonly colorType: ColorType;

	public constructor(chunk: PNGChunk, ihdrData: IHDRData) {
		super(chunk, tRNSChunkDecoder.CHUNK_SIGNATURE);
		this.colorType = ihdrData.getColorType();
	}

	public override decode(): tRNSData {
		const size: number = this.chunk.getSize();

		if (this.colorType == ColorType.GREYSCALE && size != 2) {
			throw new Error("tRNS chunk size must be 2 bytes if color type value is 0: got " + size + ".");
		} else if (this.colorType == ColorType.TRUECOLOR && size != 6) {
			throw new Error("tRNS chunk size must be 6 bytes if color type value is 2: got " + size + ".");
		}

		return new tRNSData(this.getChunkData().clone());
	}

}
