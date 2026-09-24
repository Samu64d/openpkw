//
// StringByteEncoder.ts
//

import TextEncoding from "../memory/TextEncoding.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";
import Encoder from "./Encoder.ts";

export default class StringByteEncoder implements Encoder<string> {

	private static readonly UTF_8_ENCODER: TextEncoder = new TextEncoder();

	private static calculateSizeInBytesAsUtf8(string: string): number {
		let sizeInBytes: number = 0;

		for (let i: number = 0; i < string.length; i++) {
			const charCode: number = string.charCodeAt(i);
			if (charCode < 0x80) {
				sizeInBytes += 1;
			} else if (charCode < 0x800) {
				sizeInBytes += 2;
			} else if (charCode >= 0xD800 && charCode <= 0xDBFF && i + 1 < string.length) {
				const nextCharCode: number = string.charCodeAt(i + 1);
				if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
					sizeInBytes += 4;
					i++;
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

	public constructor(textEncoding: TextEncoding = TextEncoding.UTF_8) {
		this.textEncoding = textEncoding;
	}

	public getTextEncoding(): TextEncoding {
		return this.textEncoding;
	}

	public setTextEncoding(textEncoding: TextEncoding): void {
		this.textEncoding = textEncoding;
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
		const dest: Uint8Array = byteBuffer.unsafeGetData();

		for (let i: number = 0; i < source.length; i++) {
			const charCode: number = source.charCodeAt(i);

			if (charCode > 0x7F) {
				byteBuffer.dispose();
				throw new Error("Encountered incorrect char value to be encoded: " + charCode + ".");
			}

			dest[i] = charCode;
		}

		return byteBuffer;
	}

	private encodeUtf8(source: string): ByteBuffer {
		const sizeInBytes: number = StringByteEncoder.calculateSizeInBytesAsUtf8(source);
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(sizeInBytes);
		const dest: Uint8Array = byteBuffer.unsafeGetData();
		const encoderResult: TextEncoderEncodeIntoResult = StringByteEncoder.UTF_8_ENCODER.encodeInto(source, dest);

		if (encoderResult.written !== sizeInBytes) {
			byteBuffer.dispose();
			throw new Error("UTF-8 encoding produced an unexpected byte length.");
		}

		return byteBuffer;
	}

	private encodeUtf16LE(source: string): ByteBuffer {
		const sizeInBytes: number = source.length * 2;
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(sizeInBytes);
		const dest: Uint8Array = byteBuffer.unsafeGetData();

		for (let i: number = 0; i < source.length; i++) {
			const k: number = i * 2;
			const charCode: number = source.charCodeAt(i);
			const low: number = charCode & 0xFF;
			const high: number = (charCode >>> 8) & 0xFF;

			dest[k] = low;
			dest[k + 1] = high;
		}

		return byteBuffer;
	}

}
