//
// StringByteEncoder.ts
//

import Spannable from "../memory/Spannable.ts";
import ByteBuffer from "../io/buffer/ByteBuffer.ts";
import TextEncoding from "./TextEncoding.ts";
import Encoder from "./Encoder.ts";

export default class StringByteEncoder implements Encoder<string> {

	private static readonly ASCII_REPLACEMENT_BYTE: number = 0x3F;

	private static readonly UTF_8_REPLACEMENT_BYTES: number[] = [0xEF, 0xBF, 0xBD];

	private static readonly UTF_16LE_REPLACEMENT_BYTES: number[] = [0xFD, 0xFF];

	private static calculateUtf8SizeInBytes(source: string): number {
		let sizeInBytes: number = 0;

		for (let i: number = 0; i < source.length; i++) {
			const charCode: number = source.charCodeAt(i);

			if (charCode < 0x80) {
				sizeInBytes += 1;
			} else if (charCode < 0x800) {
				sizeInBytes += 2;
			} else if (charCode >= 0xD800 && charCode <= 0xDBFF) {
				if (i + 1 < source.length && source.charCodeAt(i + 1) >= 0xDC00 && source.charCodeAt(i + 1) <= 0xDFFF) {
					sizeInBytes += 4;
					i += 1;
				} else {
					sizeInBytes += 3;
				}
			} else {
				sizeInBytes += 3;
			}
		}

		return sizeInBytes;
	}

	private textEncoding: TextEncoding;
	private strict: boolean;

	public constructor(textEncoding: TextEncoding = TextEncoding.UTF_8, strict: boolean = false) {
		this.textEncoding = textEncoding;
		this.strict = strict;
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

	public encode(source: string): ByteBuffer {
		switch (this.textEncoding) {
			case TextEncoding.ASCII:
				{
					return this.encodeAscii(source);
				}
			case TextEncoding.UTF_8:
				{
					return this.encodeUtf8(source);
				}
			case TextEncoding.UTF_16LE:
				{
					return this.encodeUtf16LE(source);
				}
			default:
				{
					throw new Error("Unknown text encoding.");
				}
		}
	}

	private encodeAscii(source: string): ByteBuffer {
		const sizeInBytes: number = source.length;
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(sizeInBytes);
		const dest: Spannable = byteBuffer.unsafeGetSourceView();
		let i: number = 0;

		while (i < source.length) {
			const charCode: number = source.charCodeAt(i);

			if (charCode <= 0x7F) {
				dest[i] = charCode;
			} else {
				if (this.strict == true) {
					byteBuffer.dispose();
					throw new Error("Malformed string for ASCII: encountered incorrect char value at index: " + i + ".");
				}

				dest[i] = StringByteEncoder.ASCII_REPLACEMENT_BYTE;
			}

			i += 1;
		}

		return byteBuffer;
	}

	private encodeUtf8(source: string): ByteBuffer {
		const sizeInBytes: number = StringByteEncoder.calculateUtf8SizeInBytes(source);
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(sizeInBytes);
		const dest: Spannable = byteBuffer.unsafeGetSourceView();
		let srcIndex: number = 0;
		let destIndex: number = 0;

		while (srcIndex < source.length) {
			const charCode: number = source.charCodeAt(srcIndex);
			let valid: boolean = false;

			if (charCode < 0x80) {
				dest[destIndex] = charCode;
				srcIndex += 1;
				destIndex += 1;
				valid = true;
			} else if (charCode < 0x800) {
				dest[destIndex] = 0xC0 | (charCode >> 6);
				dest[destIndex + 1] = 0x80 | (charCode & 0x3F);
				srcIndex += 1;
				destIndex += 2;
				valid = true;
			} else if (charCode >= 0xD800 && charCode <= 0xDBFF && srcIndex + 1 < source.length) {
				const nextCharCode: number = source.charCodeAt(srcIndex + 1);

				if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
					const codePoint: number = ((charCode - 0xD800) << 10) + (nextCharCode - 0xDC00) + 0x10000;

					dest[destIndex] = 0xF0 | (codePoint >> 18);
					dest[destIndex + 1] = 0x80 | ((codePoint >> 12) & 0x3F);
					dest[destIndex + 2] = 0x80 | ((codePoint >> 6) & 0x3F);
					dest[destIndex + 3] = 0x80 | (codePoint & 0x3F);
					srcIndex += 2;
					destIndex += 4;
					valid = true;
				}
			} else if (charCode < 0xD800 || charCode > 0xDFFF) {
				dest[destIndex] = 0xE0 | (charCode >> 12);
				dest[destIndex + 1] = 0x80 | ((charCode >> 6) & 0x3F);
				dest[destIndex + 2] = 0x80 | (charCode & 0x3F);
				srcIndex += 1;
				destIndex += 3;
				valid = true;
			}

			if (valid == false) {
				if (this.strict == true) {
					byteBuffer.dispose();
					throw new Error("Malformed string for UTF-8: encountered invalid character at index " + srcIndex + ".");
				}

				dest[destIndex] = StringByteEncoder.UTF_8_REPLACEMENT_BYTES[0];
				dest[destIndex + 1] = StringByteEncoder.UTF_8_REPLACEMENT_BYTES[1];
				dest[destIndex + 2] = StringByteEncoder.UTF_8_REPLACEMENT_BYTES[2];
				srcIndex += 1;
				destIndex += 3;
			}
		}

		return byteBuffer;
	}

	private encodeUtf16LE(source: string): ByteBuffer {
		const sizeInBytes: number = source.length * 2;
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(sizeInBytes);
		const dest: Spannable = byteBuffer.unsafeGetSourceView();
		let srcIndex: number = 0;
		let destIndex: number = 0;

		while (srcIndex < source.length) {
			const charCode: number = source.charCodeAt(srcIndex);
			let valid: boolean = false;

			if (charCode >= 0xD800 && charCode <= 0xDBFF && srcIndex + 1 < source.length) {
				const nextCharCode: number = source.charCodeAt(srcIndex + 1);

				if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
					dest[destIndex] = charCode & 0xFF;
					dest[destIndex + 1] = (charCode >>> 8) & 0xFF;
					dest[destIndex + 2] = nextCharCode & 0xFF;
					dest[destIndex + 3] = (nextCharCode >>> 8) & 0xFF;
					srcIndex += 2;
					destIndex += 4;
					valid = true;
				}
			} else if (charCode < 0xDC00 || charCode > 0xDFFF) {
				dest[destIndex] = charCode & 0xFF;
				dest[destIndex + 1] = (charCode >>> 8) & 0xFF;
				srcIndex += 1;
				destIndex += 2;
				valid = true;
			}

			if (valid == false) {
				if (this.strict == true) {
					byteBuffer.dispose();
					throw new Error("Malformed string for UTF-16LE: encountered invalid character at index " + srcIndex + ".");
				}

				dest[destIndex] = StringByteEncoder.UTF_16LE_REPLACEMENT_BYTES[0];
				dest[destIndex + 1] = StringByteEncoder.UTF_16LE_REPLACEMENT_BYTES[1];
				srcIndex += 1;
				destIndex += 2;
			}
		}

		return byteBuffer;
	}

}
