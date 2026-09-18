//
// InterlaceDecoder.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Decoder from "../../Decoder.ts";
import FilterDecoder from "../filter/FilterDecoder.ts";

export default class InterlaceDecoder extends Decoder<ByteBuffer> {

	private static readonly ROW_START_PER_PASS_LIST: number[] = [0, 0, 4, 0, 2, 0, 1];

	private static readonly COL_START_PER_PASS_LIST: number[] = [0, 4, 0, 2, 0, 1, 0];

	private static readonly ROW_INCREMENT_PER_PASS_LIST: number[] = [8, 8, 8, 4, 4, 2, 2];

	private static readonly COL_INCREMENT_PER_PASS_LIST: number[] = [8, 8, 4, 4, 2, 2, 1];

	private readonly width: number;
	private readonly height: number;
	private readonly bitsPerPixel: number;
	private readonly rowDataSize: number;
	private readonly destination: ByteBuffer;

	public constructor(source: ByteBuffer, width: number, height: number, bitsPerPixel: number) {
		super(source);
		this.width = width;
		this.height = height;
		this.bitsPerPixel = bitsPerPixel;
		this.rowDataSize = Math.ceil((width * bitsPerPixel) / 8);
		this.destination = ByteBuffer.ALLOCATE(height * this.rowDataSize);
	}

	public override decode(): ByteBuffer {
		const bytesPerPixel: number = Math.max(1, Math.ceil(this.bitsPerPixel / 8));
		let cursor: number = 0;

		for (let pass: number = 0; pass < 7; pass++) {
			const rowStart: number = InterlaceDecoder.ROW_START_PER_PASS_LIST[pass];
			const rowIncrement: number = InterlaceDecoder.ROW_INCREMENT_PER_PASS_LIST[pass];
			const colStart: number = InterlaceDecoder.COL_START_PER_PASS_LIST[pass];
			const colIncrement: number = InterlaceDecoder.COL_INCREMENT_PER_PASS_LIST[pass];

			const blockWidth: number = this.width > colStart ? Math.ceil((this.width - colStart) / colIncrement) : 0;
			const blockHeight: number = this.height > rowStart ? Math.ceil((this.height - rowStart) / rowIncrement) : 0;

			if (blockWidth == 0 || blockHeight == 0) {
				continue;
			}

			const rowDataSize: number = Math.ceil((blockWidth * this.bitsPerPixel) / 8);
			const scanlineSize: number = rowDataSize + 1;
			const passDataSize: number = blockHeight * scanlineSize;

			if (cursor + passDataSize > this.source.getSize()) {
				throw new Error("Insufficient interlaced image data for pass " + pass + ": need " + passDataSize + " bytes got " + (this.source.getSize() - cursor) + ".");
			}

			const view: ByteBuffer = this.source.view(cursor, passDataSize);
			const unfilteredData: ByteBuffer = new FilterDecoder(view, blockHeight, scanlineSize, bytesPerPixel).decode();

			this.distributePass(unfilteredData, pass, blockWidth, blockHeight);
			cursor += passDataSize;
		}

		if (cursor != this.source.getSize()) {
			throw new Error("Unexpected trailing data after interlaced image: " + (this.source.getSize() - cursor) + " bytes.");
		}

		return this.destination;
	}

	private distributePass(source: ByteBuffer, pass: number, blockWidth: number, blockHeight: number): void {
		const rowStart: number = InterlaceDecoder.ROW_START_PER_PASS_LIST[pass];
		const rowIncrement: number = InterlaceDecoder.ROW_INCREMENT_PER_PASS_LIST[pass];
		const colStart: number = InterlaceDecoder.COL_START_PER_PASS_LIST[pass];
		const colIncrement: number = InterlaceDecoder.COL_INCREMENT_PER_PASS_LIST[pass];

		const sourceRowSize: number = Math.ceil((blockWidth * this.bitsPerPixel) / 8);
		let sourceIndex: number = 0;

		if (this.bitsPerPixel < 8) {
			const mask: number = (1 << this.bitsPerPixel) - 1;

			for (let blockRow: number = 0; blockRow < blockHeight; blockRow++) {
				const destRow: number = rowStart + blockRow * rowIncrement;

				for (let blockCol: number = 0; blockCol < blockWidth; blockCol++) {
					const srcBitOffset: number = blockCol * this.bitsPerPixel;
					const srcByteOffset: number = sourceIndex + (srcBitOffset >> 3);
					const srcShift: number = 8 - (srcBitOffset & 7) - this.bitsPerPixel;
					const srcByte: number = source.get(srcByteOffset);
					const byteValue: number = (srcByte >> srcShift) & mask;

					const destCol: number = colStart + blockCol * colIncrement;
					const destBitOffset: number = destCol * this.bitsPerPixel;
					const destByteOffset: number = destRow * this.rowDataSize + (destBitOffset >> 3);
					const destShift: number = 8 - (destBitOffset & 7) - this.bitsPerPixel;
					const oldByteValue: number = this.destination.get(destByteOffset);

					const clearMask: number = ~(mask << destShift) & 0xFF;
					const newByteValue: number = (oldByteValue & clearMask) | (byteValue << destShift);

					this.destination.set(destByteOffset, newByteValue);
				}

				sourceIndex += sourceRowSize;
			}
		} else {
			const bytesPerPixel: number = this.bitsPerPixel / 8;

			for (let blockRow: number = 0; blockRow < blockHeight; blockRow++) {
				const destRowOffset: number = (rowStart + blockRow * rowIncrement) * this.rowDataSize;

				for (let blockCol: number = 0; blockCol < blockWidth; blockCol++) {
					const sourceOffset: number = sourceIndex + blockCol * bytesPerPixel;
					const destOffset: number = destRowOffset + (colStart + blockCol * colIncrement) * bytesPerPixel;

					for (let b: number = 0; b < bytesPerPixel; b++) {
						const value: number = source.get(sourceOffset + b);
						this.destination.set(destOffset + b, value);
					}
				}

				sourceIndex += sourceRowSize;
			}
		}
	}

}
