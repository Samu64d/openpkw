//
// FilterDecoder.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import SingleValueDecoder from "../../../codec/SingleValueDecoder.ts";
import FilterType from "./FilterType.ts";

export default class FilterDecoder extends SingleValueDecoder<ByteBuffer> {

	private static paethPredictor(a: number, b: number, c: number): number {
		const p: number = a + b - c;
		const pA: number = Math.abs(p - a);
		const pB: number = Math.abs(p - b);
		const pC: number = Math.abs(p - c);

		if (pA <= pB && pA <= pC) {
			return a;
		}
		if (pB <= pC) {
			return b;
		}
		return c;
	}

	private readonly scanlineCount: number;
	private readonly scanlineSize: number;
	private readonly scanlinePixelSize: number;
	private readonly destination: ByteBuffer;

	public constructor(source: ByteBuffer, scanlineCount: number, scanlineSize: number, scanlinePixelSize: number) {
		super(source);
		const bufferSize: number = source.getSize();
		const expectedSize: number = scanlineCount * scanlineSize;
		const rowSize: number = scanlineSize - 1; // We need to exclude the leading filter type byte to get the actual data size.

		if (bufferSize != expectedSize) {
			throw new Error("Filter buffer size must be equal to scanlineCount * scanlineSize: got " + bufferSize + " =/= " + expectedSize + ".");
		}
		if (rowSize % scanlinePixelSize != 0) {
			throw new Error("Scanline data size must be a multiple of scanline pixel size value: got " + rowSize + " % " + scanlinePixelSize + " =/= 0.");
		}

		this.scanlineCount = scanlineCount;
		this.scanlineSize = scanlineSize;
		this.scanlinePixelSize = scanlinePixelSize;
		this.destination = ByteBuffer.ALLOCATE(this.scanlineCount * rowSize);
	}

	public override decode(): ByteBuffer {
		const src: ByteBuffer = this.source;
		const destRowCount: number = this.scanlineCount;
		const destRowSize: number = this.scanlineSize - 1;
		const dest: ByteBuffer = this.destination;

		for (let y: number = 0; y < destRowCount; y++) {
			const srcRowStart: number = y * this.scanlineSize + 1;
			const destRowStart: number = y * destRowSize;
			const filterType: FilterType = src.get(y * this.scanlineSize);

			switch (true) {
				case filterType == FilterType.NONE:
				case filterType == FilterType.UP && y == 0:
					{
						this.source.copyTo(dest, srcRowStart, srcRowStart + destRowSize, destRowStart);
						break;
					}
				case filterType == FilterType.SUB:
				case filterType == FilterType.PAETH && y == 0:
					{
						this.source.copyTo(dest, srcRowStart, srcRowStart + this.scanlinePixelSize, destRowStart);

						for (let x: number = this.scanlinePixelSize; x < destRowSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							const value: number = src.get(srcIndex) + dest.get(destIndex - this.scanlinePixelSize);

							dest.set(destIndex, value & 0xFF);
						}
						break;
					}
				case filterType == FilterType.UP:
					{
						for (let x: number = 0; x < destRowSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							const value: number = src.get(srcIndex) + dest.get(destIndex - destRowSize);

							dest.set(destIndex, value & 0xFF);
						}
						break;
					}
				case filterType == FilterType.AVERAGE:
					{

						for (let x: number = 0; x < this.scanlinePixelSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							const upValue: number = y > 0 ? dest.get(destIndex - destRowSize) : 0;
							const value: number = src.get(srcIndex) + (upValue >>> 1);

							dest.set(destIndex, value & 0xFF);
						}

						for (let x: number = this.scanlinePixelSize; x < destRowSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							let sum: number = dest.get(destIndex - this.scanlinePixelSize);
							if (y > 0) sum += dest.get(destIndex - destRowSize);
							const value: number = src.get(srcIndex) + (sum >>> 1);

							dest.set(destIndex, value & 0xFF);
						}
						break;
					}
				case filterType == FilterType.PAETH:
					{

						for (let x: number = 0; x < this.scanlinePixelSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							const value: number = src.get(srcIndex) + dest.get(destIndex - destRowSize);

							dest.set(destIndex, value & 0xFF);
						}

						for (let x: number = this.scanlinePixelSize; x < destRowSize; x++) {
							const srcIndex: number = srcRowStart + x;
							const destIndex: number = destRowStart + x;
							const subValue: number = dest.get(destIndex - this.scanlinePixelSize);
							const upValue: number = dest.get(destIndex - destRowSize);
							const upSubValue: number = dest.get(destIndex - destRowSize - this.scanlinePixelSize);
							const value: number = src.get(srcIndex) + FilterDecoder.paethPredictor(subValue, upValue, upSubValue);

							dest.set(destIndex, value & 0xFF);
						}
						break;
					}
				default:
					{
						throw new Error("Unknown filter type value: " + filterType + ".");
					}
			}
		}

		return this.destination;
	}

}
