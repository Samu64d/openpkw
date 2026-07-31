//
// IHDRChunkDecoder.ts
//

import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IHDRChunkDecoder extends PNGChunkDecoder {

	public static readonly NAME_SIGNATURE: number = 0x49484452;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {

		const size: number = this.read(position, 4);
		const name: number = this.read(position + 4, 4);
		const dataPosition: number = position + PNGDecoder.CHUNK_DATA_LOCATION;

		const crcPosition: number = position + size;

		if (size != 13) {
			throw new Error("IHDR chunk size is not valid");
		}

		if (name != PNGDecoder.IHDR_CHUNK_NAME) {
			throw new Error("IHDR chunk name is not valid");
		}

		const width: number = this.read(dataPosition, 4);
		const height: number = this.read(dataPosition + 4, 4);
		const depth: number = this.read(dataPosition + 8);
		const colorType: number = this.read(dataPosition + 9);
		const compressionType: number = this.read(dataPosition + 10);
		const filterType: number = this.read(dataPosition + 11);
		const interlaceType: number = this.read(dataPosition + 12);
		alert("width: " + width + ", height: " + height + ", depth: " + depth + ", colorType: " + colorType);
		alert("compressionType: " + compressionType + ", filterType: " + filterType + ", interlaceType: " + interlaceType);

	}

}
