//
// StringByteEncoder.ts
//

import TextEncoding from "../memory/TextEncoding.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";

export default class StringByteEncoder {

	private static readonly UTF_8_ENCODER: TextEncoder = new TextEncoder();

	private readonly string: string;

	public constructor(string: string) {
		this.string = string;
	}

	public getString(): string {
		return this.string;
	}

	public encode(textEncoding: TextEncoding = TextEncoding.UTF_8): ByteBuffer {
		switch (textEncoding) {
			case TextEncoding.ASCII:
				{
					return this.encodeAscii();
				}
			case TextEncoding.UTF_8:
				{
					return this.encodeUtf8();
				}
			case TextEncoding.UTF_16LE:
				{
					return this.encodeUtf16LE();
				}
			default:
				{
					throw new Error("Unknown text encoding.");
				}
		}
	}

	private encodeAscii(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length);
		for (let i: number = 0; i < this.string.length; i++) {
			const charCode: number = this.string.charCodeAt(i);

			if (charCode > 0x7F) {
				throw new Error("Encountered incorrect char value to be encoded.");
			}

			byteBuffer.set(i, charCode);
		}
		return byteBuffer;
	}

	private encodeUtf8(): ByteBuffer {
		const array: Uint8Array = StringByteEncoder.UTF_8_ENCODER.encode(this.string);
		return new ByteBuffer(array);
	}

	private encodeUtf16LE(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length * 2);
		for (let i: number = 0; i < this.string.length; i++) {
			const k: number = i * 2;
			const charCode: number = this.string.charCodeAt(i);
			const low: number = charCode & 0xFF;
			const high: number = (charCode >>> 8) & 0xFF;
			byteBuffer.set(k, low);
			byteBuffer.set(k + 1, high);
		}
		return byteBuffer;
	}

}
