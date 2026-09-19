//
// IHDRChunkDecoder.ts
//

import Endian from "../../../memory/Endian.ts";
import ByteBufferReader from "../../../io/ByteBufferReader.ts";
import IHDRData from "../data/IHDRData.ts";
import InterlaceMethod from "../interlace/InterlaceMethod.ts";
import ColorType from "../image/ColorType.ts";
import PNGChunk from "./PNGChunk.ts";
import PNGChunkDecoder from "./PNGChunkDecoder.ts";

export default class IHDRChunkDecoder extends PNGChunkDecoder<IHDRData> {

	public static readonly CHUNK_SIGNATURE: number = 0x49484452;

	private static readonly MAX_IMAGE_DIMENSION: number = 0x7FFFFFFF;

	public constructor(chunk: PNGChunk) {
		super(chunk, IHDRChunkDecoder.CHUNK_SIGNATURE, 13, 13);
	}

	public override decode(): IHDRData {
		const reader: ByteBufferReader = new ByteBufferReader(this.getChunkData());

		const width: number = reader.readUint32(null, Endian.BIG);
		const height: number = reader.readUint32(null, Endian.BIG);
		const depth: number = reader.readUint8();
		const colorType: number = reader.readUint8();
		const compressionMethod: number = reader.readUint8();
		const filterMethod: number = reader.readUint8();
		const interlaceMethod: number = reader.readUint8();

		reader.dispose();

		if (width == 0 || height == 0 || width > IHDRChunkDecoder.MAX_IMAGE_DIMENSION || height > IHDRChunkDecoder.MAX_IMAGE_DIMENSION) {
			throw new Error("Invalid image size values: " + width + "x" + height + ".");
		}

		if (ColorType.is(colorType) == false) {
			throw new Error("Unknown color type value: " + colorType + ".");
		}

		if (ColorType.allowDepth(colorType, depth) == false) {
			throw new Error("Invalid depth value for used color type: " + depth + ".");
		}

		if (compressionMethod != 0) {
			throw new Error("Compression method value must be 0: got " + compressionMethod + ".");
		}

		if (filterMethod != 0) {
			throw new Error("Filter method value must be 0: got " + filterMethod + ".");
		}

		if (InterlaceMethod.is(interlaceMethod) == false) {
			throw new Error("Unknown interlace method value: " + interlaceMethod + ".");
		}

		return new IHDRData(width, height, depth, colorType, compressionMethod, filterMethod, interlaceMethod);
	}

}
