//
// StringByteDecoder.ts
//

import Spannable from "../memory/Spannable.ts";
import BaseByteBuffer from "../io/buffer/BaseByteBuffer.ts";
import TextEncoding from "./TextEncoding.ts";
import Decoder from "./Decoder.ts";

export default class StringByteDecoder implements Decoder<string> {

	private static readonly ASCII_REPLACEMENT_CHAR_CODE: number = 0x3F;

	private static readonly UNICODE_REPLACEMENT_CODE_POINT: number = 0xFFFD;

	private static readonly CHUNK_SIZE: number = 4096;

	private textEncoding: TextEncoding;
	private strict: boolean;
	private readonly chunk: Uint16Array;

	public constructor(textEncoding: TextEncoding = TextEncoding.UTF_8, strict: boolean = false) {
		this.textEncoding = textEncoding;
		this.strict = strict;
		this.chunk = new Uint16Array(StringByteDecoder.CHUNK_SIZE);
	}

	public getTextEncoding(): TextEncoding {
		return this.textEncoding;
	}

	public setTextEncoding(textEncoding: TextEncoding): void {
		this.textEncoding = textEncoding;
	}

	public isStrict(): boolean {
		return this.strict;
	}

	public setStrict(strict: boolean): void {
		this.strict = strict;
	}

	public decode(source: BaseByteBuffer): string {
		switch (this.textEncoding) {
			case TextEncoding.ASCII:
				{
					return this.decodeAscii(source);
				}
			case TextEncoding.UTF_8:
				{
					return this.decodeUtf8(source);
				}
			case TextEncoding.UTF_16LE:
				{
					return this.decodeUtf16LE(source);
				}
			default:
				{
					throw new Error("Unknown text encoding.");
				}
		}
	}

	private decodeAscii(source: BaseByteBuffer): string {
		const src: Spannable = source.unsafeGetSource();
		const sizeInBytes: number = source.getCapacity();
		let i: number = 0;
		let chunkIndex: number = 0;
		let dest: string = "";

		while (i < sizeInBytes) {
			if (chunkIndex >= StringByteDecoder.CHUNK_SIZE - 2) {
				dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));
				chunkIndex = 0;
			}

			const charCode: number = src[i];

			if (charCode <= 0x7F) {
				this.chunk[chunkIndex] = charCode;
			} else {
				if (this.strict == true) {
					throw new Error("Invalid byte data for ASCII: encountered incorrect byte value to be decoded: " + charCode + ".");
				}

				this.chunk[chunkIndex] = StringByteDecoder.ASCII_REPLACEMENT_CHAR_CODE;
			}

			chunkIndex += 1;
			i += 1;
		}

		dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));

		return dest;
	}

	private decodeUtf8(source: BaseByteBuffer): string {
		const src: Spannable = source.unsafeGetSource();
		const sizeInBytes: number = source.getCapacity();
		let srcIndex: number = 0;
		let chunkIndex: number = 0;
		let dest: string = "";

		while (srcIndex < sizeInBytes) {
			if (chunkIndex >= StringByteDecoder.CHUNK_SIZE - 2) {
				dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));
				chunkIndex = 0;
			}

			const b1: number = src[srcIndex];
			let valid: boolean = false;

			if (b1 <= 0x7F) {
				this.chunk[chunkIndex] = b1;
				chunkIndex += 1;
				srcIndex += 1;
				valid = true;
			} else if (b1 >= 0xC2 && b1 <= 0xDF && srcIndex + 1 < sizeInBytes) {
				const b2: number = src[srcIndex + 1];

				if ((b2 & 0xC0) == 0x80) {
					const codePoint = ((b1 & 0x1F) << 6) | (b2 & 0x3F);

					this.chunk[chunkIndex] = codePoint;
					chunkIndex += 1;
					srcIndex += 2;
					valid = true;
				}
			} else if (b1 >= 0xE0 && b1 <= 0xEF && srcIndex + 2 < sizeInBytes) {
				const b2: number = src[srcIndex + 1];
				const b3: number = src[srcIndex + 2];

				if ((b2 & 0xC0) == 0x80 && (b3 & 0xC0) == 0x80) {
					const codePoint = ((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F);

					if (codePoint >= 0x800 && (codePoint < 0xD800 || codePoint > 0xDFFF)) {
						this.chunk[chunkIndex] = codePoint;
						chunkIndex += 1;
						srcIndex += 3;
						valid = true;
					}
				}
			} else if (b1 >= 0xF0 && b1 <= 0xF4 && srcIndex + 3 < sizeInBytes) {
				const b2: number = src[srcIndex + 1];
				const b3: number = src[srcIndex + 2];
				const b4: number = src[srcIndex + 3];

				if ((b2 & 0xC0) == 0x80 && (b3 & 0xC0) == 0x80 && (b4 & 0xC0) == 0x80) {
					const codePoint = ((b1 & 0x07) << 18) | ((b2 & 0x3F) << 12) | ((b3 & 0x3F) << 6) | (b4 & 0x3F);

					if (codePoint >= 0x10000 && codePoint <= 0x10FFFF) {
						this.chunk[chunkIndex] = ((codePoint - 0x10000) >>> 10) + 0xD800;
						this.chunk[chunkIndex + 1] = ((codePoint - 0x10000) & 0x3FF) + 0xDC00;
						chunkIndex += 2;
						srcIndex += 4;
						valid = true;
					}
				}
			}

			if (valid == false) {
				if (this.strict == true) {
					throw new Error("Invalid byte data for UTF-8: encountered malformed byte sequence at index " + srcIndex + ".");
				}

				this.chunk[chunkIndex] = StringByteDecoder.UNICODE_REPLACEMENT_CODE_POINT;
				chunkIndex += 1;
				srcIndex += 1;
			}
		}

		dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));

		return dest;
	}

	private decodeUtf16LE(source: BaseByteBuffer): string {
		if (source.getCapacity() % 2 != 0) {
			throw new Error("Byte buffer to be decoded has incorrect size: " + source.getCapacity() + ".");
		}

		const src: Spannable = source.unsafeGetSource();
		const sizeInBytes: number = source.getCapacity();
		let srcIndex: number = 0;
		let chunkIndex: number = 0;
		let dest: string = "";

		while (srcIndex < sizeInBytes) {
			if (chunkIndex >= StringByteDecoder.CHUNK_SIZE - 2) {
				dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));
				chunkIndex = 0;
			}

			const codeUnit: number = src[srcIndex] | (src[srcIndex + 1] << 8);
			let valid: boolean = false;

			if (codeUnit < 0xD800 || codeUnit > 0xDFFF) {
				this.chunk[chunkIndex] = codeUnit;
				chunkIndex += 1;
				srcIndex += 2;
				valid = true;
			} else if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF && srcIndex + 3 < sizeInBytes) {
				const nextCodeUnit: number = src[srcIndex + 2] | (src[srcIndex + 3] << 8);

				if (nextCodeUnit >= 0xDC00 && nextCodeUnit <= 0xDFFF) {
					this.chunk[chunkIndex] = codeUnit;
					this.chunk[chunkIndex + 1] = nextCodeUnit;
					chunkIndex += 2;
					srcIndex += 4;
					valid = true;
				}
			}

			if (valid == false) {
				if (this.strict == true) {
					throw new Error("Invalid byte data for UTF-16LE: encountered malformed byte sequence at index " + srcIndex + ".");
				}

				this.chunk[chunkIndex] = StringByteDecoder.UNICODE_REPLACEMENT_CODE_POINT;
				chunkIndex += 1;
				srcIndex += 2;
			}
		}

		dest += String.fromCharCode(...this.chunk.subarray(0, chunkIndex));

		return dest;
	}

}
