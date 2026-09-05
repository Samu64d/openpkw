//
// IHDRChunkDecoder.ts
//

import Endian from "../../../memory/Endian.ts";
import IHDRData from "../data/IHDRData.ts";
import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IHDRChunkDecoder extends PNGChunkDecoder<IHDRData> {

	public static override readonly CHUNK_SIGNATURE: number = 0x49484452;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): IHDRData {
		const width: number = this.reader.readUint32(null, Endian.BIG);
		const height: number = this.reader.readUint32(null, Endian.BIG);
		const depth: number = this.reader.readUint8();
		const colorType: number = this.reader.readUint8();
		const compressionType: number = this.reader.readUint8();
		const filterType: number = this.reader.readUint8();
		const interlaceType: number = this.reader.readUint8();
		return new IHDRData(width, height, depth, colorType, compressionType, filterType, interlaceType);
	}

}
