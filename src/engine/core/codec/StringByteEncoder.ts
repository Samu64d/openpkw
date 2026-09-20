//
// StringByteEncoder.ts
//

import TextEncoding from "../memory/TextEncoding.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";
import Encoder from "./Encoder.ts";

export default class StringByteEncoder implements Encoder<string> {

	private static readonly UTF_8_ENCODER: TextEncoder = new TextEncoder();

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
		const dest: Uint8Array = new Uint8Array(source.length);

		for (let i: number = 0; i < source.length; i++) {
			const charCode: number = source.charCodeAt(i);

			if (charCode > 0x7F) {
				throw new Error("Encountered incorrect char value to be encoded: " + charCode + ".");
			}

			dest[i] = charCode;
		}

		return ByteBuffer.FROM_ARRAY(dest);
	}

	private encodeUtf8(source: string): ByteBuffer {
		const dest: Uint8Array = StringByteEncoder.UTF_8_ENCODER.encode(source);
		return ByteBuffer.FROM_ARRAY(dest);
	}

	private encodeUtf16LE(source: string): ByteBuffer {
		const dest: Uint8Array = new Uint8Array(source.length * 2);

		for (let i: number = 0; i < source.length; i++) {
			const k: number = i * 2;
			const charCode: number = source.charCodeAt(i);
			const low: number = charCode & 0xFF;
			const high: number = (charCode >>> 8) & 0xFF;
			dest[k] = low;
			dest[k + 1] = high;
		}

		return ByteBuffer.FROM_ARRAY(dest);
	}

}
