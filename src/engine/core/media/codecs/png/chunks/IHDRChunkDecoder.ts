//
// IHDRChunkDecoder.ts
//

import Endian from "../../../../memory/Endian.ts";
import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

export default class IHDRChunkDecoder extends PNGChunkDecoder {

	public static override readonly SIGNATURE: number = 0x49484452;

	public constructor(chunk: PNGChunk) {
		super(chunk);
	}

	public override decode(): void {
		const width: number = this.reader.readUint32(null, Endian.BIG);
		const height: number = this.reader.readUint32(null, Endian.BIG);
		const depth: number = this.reader.readUint8();
		const colorType: number = this.reader.readUint8();
		const compressionType: number = this.reader.readUint8();
		const filterType: number = this.reader.readUint8();
		const interlaceType: number = this.reader.readUint8();
		//alert("size: " + width + "x" + height + ", depth: " + depth + ", colorType: " + colorType + ", compressionType: " + compressionType + ", filterType: " + filterType + ", interlaceType: " + interlaceType);
	}

}
