//
// IHDRChunkDecoder.ts
//

import ByteOrder from "../../../memory/ByteOrder.ts";
import ByteBufferReader from "../../../io/buffer/ByteBufferReader.ts";
import Exception from "../../../error/Exception.ts";
import IHDRData from "../data/IHDRData.ts";
import InterlaceMethod from "../interlace/InterlaceMethod.ts";
import ColorType from "../image/ColorType.ts";
import Chunk from "./Chunk.ts";
import ChunkDecoder from "./ChunkDecoder.ts";

export default class IHDRChunkDecoder extends ChunkDecoder<IHDRData> {

	public static readonly CHUNK_SIGNATURE: number = 0x49484452;

	private static readonly MAX_IMAGE_DIMENSION: number = 0x7FFFFFFF;

	public constructor(chunk: Chunk) {
		super(chunk, IHDRChunkDecoder.CHUNK_SIGNATURE, 13, 13);
	}

	public override decode(): IHDRData {
		const reader: ByteBufferReader = new ByteBufferReader(this.getChunkData());

		const width: number = reader.readUint32(null, ByteOrder.BIG_ENDIAN);
		const height: number = reader.readUint32(null, ByteOrder.BIG_ENDIAN);
		const depth: number = reader.readUint8();
		const colorType: number = reader.readUint8();
		const compressionMethod: number = reader.readUint8();
		const filterMethod: number = reader.readUint8();
		const interlaceMethod: number = reader.readUint8();

		reader.dispose();

		if (width == 0 || height == 0 || width > IHDRChunkDecoder.MAX_IMAGE_DIMENSION || height > IHDRChunkDecoder.MAX_IMAGE_DIMENSION) {
			throw new Exception("Invalid image size values: " + width + "x" + height);
		}

		if (ColorType.is(colorType) == false) {
			throw new Exception("Unknown color type value: " + colorType);
		}

		if (ColorType.allowDepth(colorType, depth) == false) {
			throw new Exception("Invalid depth value for used color type: " + depth);
		}

		if (compressionMethod != 0) {
			throw new Exception("Compression method value must be 0: got " + compressionMethod);
		}

		if (filterMethod != 0) {
			throw new Exception("Filter method value must be 0: got " + filterMethod);
		}

		if (InterlaceMethod.is(interlaceMethod) == false) {
			throw new Exception("Unknown interlace method value: " + interlaceMethod);
		}

		return new IHDRData(width, height, depth, colorType, compressionMethod, filterMethod, interlaceMethod);
	}

}
