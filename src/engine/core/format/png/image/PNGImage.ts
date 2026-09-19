//
// PNGImage.ts
//

import Nullable from "../../../common/Nullable.ts";
import ByteBuffer from "../../../memory/ByteBuffer.ts";
import IHDRData from "../data/IHDRData.ts";
import PLTEData from "../data/PLTEData.ts";
import tRNSData from "../data/tRNSData.ts";
import IDATData from "../data/IDATData.ts";
import ColorType from "./ColorType.ts";

export default class PNGImage {

	private readonly width: number;
	private readonly height: number;
	private readonly depth: number;
	private readonly colorType: ColorType;
	private readonly paletteData: Nullable<ByteBuffer>;
	private readonly transparencyData: Nullable<ByteBuffer>;
	private readonly imageData: ByteBuffer;
	private readonly sampleBuffer: number[];
	private readonly destination: ByteBuffer;

	public constructor(ihdrData: IHDRData, idatData: IDATData, plteData: Nullable<PLTEData> = null, trnsData: Nullable<tRNSData> = null) {
		this.width = ihdrData.getWidth();
		this.height = ihdrData.getHeight();
		this.depth = ihdrData.getDepth();
		this.colorType = ihdrData.getColorType();

		if (this.colorType == ColorType.INDEXED && plteData == null) {
			throw new Error("PLTE chunk missing but required for color type 3.");
		}

		alert("decoding: " + this.colorType + " " + this.depth);

		this.paletteData = plteData != null ? plteData.getPaletteData() : null;
		this.transparencyData = trnsData != null ? trnsData.getTransparencyData() : null;
		this.imageData = idatData.getImageData();
		this.sampleBuffer = new Array<number>(4);
		this.destination = ByteBuffer.ALLOCATE(this.width * this.height * 4);
	}

	public toRGBA8(): ByteBuffer {
		switch (this.colorType) {
			case ColorType.GREYSCALE:
				{
					this.decodeGrayscale();
					break;
				}
			case ColorType.TRUECOLOR:
				{
					this.decodeTruecolor();
					break;
				}
			case ColorType.INDEXED:
				{
					this.decodeIndexed();
					break;
				}
			case ColorType.ALPHA_GREYSCALE:
				{
					this.decodeAlphaGrayscale();
					break;
				}
			case ColorType.ALPHA_TRUECOLOR:
				{
					this.decodeAlphaTruecolor();
					break;
				}
			default:
				{
					throw new Error("Unknown color type value: " + this.colorType + ".");
				}
		}

		return this.destination;
	}

	private getTrnsGrayValue(): number {
		if (this.transparencyData == null) {
			return -1;
		}
		return (this.transparencyData.get(0) << 8) | this.transparencyData.get(1);
	}

	private decodeGrayscale(): void {
		const src: ByteBuffer = this.imageData;
		const buffer: number[] = this.sampleBuffer;
		const trnsGrayValue: number = this.getTrnsGrayValue();

		if (this.depth < 8) {
			const mask: number = (1 << this.depth) - 1;
			const bytesPerRow: number = Math.ceil((this.width * this.depth) / 8);

			for (let y: number = 0; y < this.height; y++) {
				const rowStart: number = y * bytesPerRow;

				for (let x: number = 0; x < this.width; x++) {
					const bitOffset: number = x * this.depth;
					const shift: number = 8 - (bitOffset & 7) - this.depth;
					const byteValue: number = src.get(rowStart + (bitOffset >> 3));
					const value: number = (byteValue >> shift) & mask;
					const g: number = value * 255 / mask;

					buffer[0] = g;
					buffer[1] = g;
					buffer[2] = g;
					buffer[3] = value == (trnsGrayValue & mask) ? 0 : 255;
					this.destination.setArray(buffer, (y * this.width + x) * 4);
				}
			}
			return;
		}

		if (this.depth == 8) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i);
				buffer[1] = buffer[0];
				buffer[2] = buffer[0];
				buffer[3] = buffer[0] == trnsGrayValue ? 0 : 255;
				this.destination.setArray(buffer, i * 4);
			}
			return;
		}

		if (this.depth == 16) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 2);
				buffer[1] = buffer[0];
				buffer[2] = buffer[0];
				buffer[3] = ((buffer[0] << 8) | src.get(i * 2 + 1)) == trnsGrayValue ? 0 : 255;
				this.destination.setArray(buffer, i * 4);
			}
		}
	}

	private decodeTruecolor(): void {
		const src: ByteBuffer = this.imageData;
		const buffer: number[] = this.sampleBuffer;

		if (this.depth == 8) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 3);
				buffer[1] = src.get(i * 3 + 1);
				buffer[2] = src.get(i * 3 + 2);
				buffer[3] = 255;
				this.destination.setArray(buffer, i * 4);
			}
			return;
		}

		if (this.depth == 16) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 6);
				buffer[1] = src.get(i * 6 + 2);
				buffer[2] = src.get(i * 6 + 4);
				buffer[3] = 255;
				this.destination.setArray(buffer, i * 4);
			}
		}
	}

	private decodeIndexed(): void {
		if (this.paletteData == null) {
			return;
		}

		const src: ByteBuffer = this.imageData;
		const trnsSize: number = this.transparencyData != null ? this.transparencyData.getSize() : 0;
		const buffer: number[] = this.sampleBuffer;

		if (this.depth < 8) {
			const mask: number = (1 << this.depth) - 1;
			const bytesPerRow: number = Math.ceil((this.width * this.depth) / 8);

			for (let y: number = 0; y < this.height; y++) {
				const rowStart: number = y * bytesPerRow;

				for (let x: number = 0; x < this.width; x++) {
					const bitOffset: number = x * this.depth;
					const shift: number = 8 - (bitOffset & 7) - this.depth;
					const byteValue: number = src.get(rowStart + (bitOffset >> 3));
					const value: number = (byteValue >> shift) & mask;

					buffer[0] = this.paletteData.get(value * 3);
					buffer[1] = this.paletteData.get(value * 3 + 1);
					buffer[2] = this.paletteData.get(value * 3 + 2);
					buffer[3] = value < trnsSize ? this.transparencyData!.get(value) : 255;
					this.destination.setArray(buffer, (y * this.width + x) * 4);
				}
			}
			return;
		}

		for (let i: number = 0; i < this.width * this.height; i++) {
			const indexValue: number = src.get(i);

			buffer[0] = this.paletteData.get(indexValue * 3);
			buffer[1] = this.paletteData.get(indexValue * 3 + 1);
			buffer[2] = this.paletteData.get(indexValue * 3 + 2);
			buffer[3] = indexValue < trnsSize ? this.transparencyData!.get(indexValue) : 255;
			this.destination.setArray(buffer, i * 4);
		}
	}

	private decodeAlphaGrayscale(): void {
		const src: ByteBuffer = this.imageData;
		const buffer: number[] = this.sampleBuffer;

		if (this.depth == 8) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 2);
				buffer[1] = buffer[0];
				buffer[2] = buffer[0];
				buffer[3] = src.get(i * 2 + 1);
				this.destination.setArray(buffer, i * 4);
			}
			return;
		}

		if (this.depth == 16) {
			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 4);
				buffer[1] = buffer[0];
				buffer[2] = buffer[0];
				buffer[3] = src.get(i * 4 + 2);
				this.destination.setArray(buffer, i * 4);
			}
		}
	}

	private decodeAlphaTruecolor(): void {
		const src: ByteBuffer = this.imageData;

		if (this.depth == 8) {
			src.copyTo(this.destination);
			return;
		}

		if (this.depth == 16) {
			const buffer: number[] = this.sampleBuffer;

			for (let i: number = 0; i < this.width * this.height; i++) {
				buffer[0] = src.get(i * 8);
				buffer[1] = src.get(i * 8 + 2);
				buffer[2] = src.get(i * 8 + 4);
				buffer[3] = src.get(i * 8 + 6);
				this.destination.setArray(buffer, i * 4);
			}
		}
	}

}
