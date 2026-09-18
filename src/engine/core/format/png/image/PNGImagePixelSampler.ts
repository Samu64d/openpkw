//
// PNGImagePixelSampler.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";

export default class PNGImagePixelSampler {

	private static getMask(depth: number): number {
		return (1 << depth) - 1;
	}

	private readonly source: ByteBuffer;
	private readonly width: number;
	private readonly depth: number;
	private readonly bitsPerPixel: number;
	private readonly mask: number;

	public constructor(source: ByteBuffer, width: number, height: number, depth: number, channelCount: number) {
		const bufferSize: number = source.getSize();
		const expectedSize: number = (width * height * depth * channelCount);

		if (bufferSize != expectedSize) {
			throw new Error("Filter buffer size must be equal to scanlineCount * scanlineSize: got " + bufferSize + " =/= " + expectedSize + ".");
		}

		if (depth != 1 && depth != 2 && depth != 4) {
			throw new Error("Sub byte pixel data can have a maximum depth value of 4.");
		}

		this.source = source;
		this.width = width;
		this.depth = depth;
		this.bitsPerPixel = channelCount * depth;
		this.mask = PNGImagePixelSampler.getMask(depth);
	}

	public sample(x: number, y: number, channel: number): number {
		const pixelIndex: number = (y * this.width + x) * this.bitsPerPixel;
		const channelIndex = pixelIndex + this.depth * channel;
		const shift: number = 8 - (channelIndex & 7) - this.depth;
		const byteValue: number = this.source.get(channelIndex >> 3);
		return (byteValue >> shift) & this.mask;
	}

}
