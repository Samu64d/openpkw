//
// IDATChunkDecoder.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Decoder from "../../Decoder.ts";
import DeflateDecoder from "../../deflate/DeflateDecoder.ts";
import IHDRData from "../data/IHDRData.ts";
import IDATData from "../data/IDATData.ts";
import PNGChunk from "../PNGChunk.ts";
import PNGChunkDecoder from "../PNGChunkDecoder.ts";

class IDATChunkDecoder extends PNGChunkDecoder<IDATData> {

	public static override readonly CHUNK_SIGNATURE: number = 0x49444154;

	private static readonly COLOR_TYPE_TO_CHANNEL_COUNT_MAP: Readonly<Record<number, number>> = {
		0: 1,
		2: 3,
		3: 1,
		4: 2,
		6: 4
	};

	private readonly ihdrData: IHDRData;
	private readonly scanlineSize: number;
	private readonly scanlineCount: number;
	private readonly bytePerPixel: number;
	private readonly data: IDATData;

	public constructor(chunk: PNGChunk, ihdrData: IHDRData) {
		super(chunk);
		this.ihdrData = ihdrData;
		this.scanlineSize = this.calculateScanlineSize();
		this.scanlineCount = this.ihdrData.getHeight();
		this.bytePerPixel = this.calculateBytesPerPixel();
		const destinationBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.scanlineCount * (this.scanlineSize - 1));  // We need to exclude filter type bits for the destination data
		this.data = new IDATData(destinationBuffer);
	}

	public override decode(): IDATData {
		const compressedSource: ByteBuffer = this.chunk.getData();
		const deflateDecoder: DeflateDecoder = new DeflateDecoder(compressedSource);
		const source: ByteBuffer = deflateDecoder.decode();

		const filterDecoder: IDATChunkDecoder.FilterDecoder = new IDATChunkDecoder.FilterDecoder(source, this.scanlineSize, this.scanlineCount, this.bytePerPixel, this.data.getImageData());
		void filterDecoder.decode();

		return this.data;
	}

	private calculateBytesPerPixel(): number {
		const channelCount: number = IDATChunkDecoder.COLOR_TYPE_TO_CHANNEL_COUNT_MAP[this.ihdrData.getColorType()];
		return Math.max(1, Math.ceil((this.ihdrData.getDepth() * channelCount) / 8));
	}

	private calculateScanlineSize(): number {
		const channelCount: number = IDATChunkDecoder.COLOR_TYPE_TO_CHANNEL_COUNT_MAP[this.ihdrData.getColorType()];
		return Math.ceil(this.ihdrData.getWidth() * this.ihdrData.getDepth() * channelCount / 8) + 1; // We add +1 for the filter type bit
	}

}

namespace IDATChunkDecoder {

	export const enum FilterType {
		NONE = 0,
		SUB = 1,
		UP = 2,
		AVERAGE = 3,
		PAETH = 4
	}

	export class FilterDecoder implements Decoder<ByteBuffer> {

		private readonly source: ByteBuffer;
		private readonly scanlineSize: number;
		private readonly scanlineCount: number;
		private readonly bytePerPixel: number;
		private readonly destination: ByteBuffer;

		public constructor(source: ByteBuffer, scanlineSize: number, scanlineCount: number, bytePerPixel: number, destination: ByteBuffer) {
			if (source.getSize() != scanlineSize * scanlineCount) {
				throw new Error("Incorrect filter buffer size.");
			}

			this.source = source;
			this.scanlineSize = scanlineSize;
			this.scanlineCount = scanlineCount;
			this.bytePerPixel = bytePerPixel;
			this.destination = destination;
		}

		public decode(): ByteBuffer {
			for (let y = 0; y < this.scanlineCount; y++) {
				const filterType: number = this.source.get(y * this.scanlineSize);
				for (let x = 0; x < this.scanlineSize - 1; x++) {
					const sourceIndex: number = y * this.scanlineSize + x + 1;
					const destinationIndex: number = y * (this.scanlineSize - 1) + x;
					let decodedValue: number = this.source.get(sourceIndex);
					switch (filterType) {

						case FilterType.NONE:
							{
								break;
							}

						case FilterType.SUB:
							{
								if (x >= this.bytePerPixel) {
									decodedValue += this.getSubValue(destinationIndex);
								}
								break;
							}

						case FilterType.UP:
							{
								if (y > 0) {
									decodedValue += this.getUpValue(destinationIndex);
								}
								break;
							}


						case FilterType.AVERAGE:
							{
								const subValue: number = x >= this.bytePerPixel ? this.getSubValue(destinationIndex) : 0;
								const upValue: number = y > 0 ? this.getUpValue(destinationIndex) : 0;
								decodedValue += Math.floor((subValue + upValue) / 2);
								break;
							}


						case FilterType.PAETH:
							{
								const subValue: number = x >= this.bytePerPixel ? this.getSubValue(destinationIndex) : 0;
								const upValue: number = y > 0 ? this.getUpValue(destinationIndex) : 0;
								const upSubValue: number = x >= this.bytePerPixel && y > 0 ? this.getUpSubValue(destinationIndex) : 0;
								decodedValue += this.calculatePaethPredictor(subValue, upValue, upSubValue);
								break;
							}

						default:
							{
								throw new Error("Unknown filter type value.");
							}
					}

					this.destination.set(destinationIndex, decodedValue & 0xFF);
				}
			}

			return this.destination;
		}

		private getSubValue(index: number): number {
			return this.destination.get(index - this.bytePerPixel);
		}

		private getUpValue(index: number): number {
			return this.destination.get(index - this.scanlineSize + 1);
		}

		private getUpSubValue(index: number): number {
			return this.destination.get(index - this.scanlineSize - this.bytePerPixel + 1);
		}

		private calculatePaethPredictor(a: number, b: number, c: number): number {
			const p: number = a + b - c;
			const pA: number = Math.abs(p - a);
			const pB: number = Math.abs(p - b);
			const pC: number = Math.abs(p - c);

			if (pA <= pB && pA <= pC) {
				return a;
			} else if (pB <= pC) {
				return b;
			} else {
				return c;
			}
		}

	}

}

export default IDATChunkDecoder;
