//
// StringByteEncoder.ts
//

import TextEncoding from "./TextEncoding.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class StringByteEncoder {

	private readonly string: string;
	private readonly textEncoder: TextEncoder;

	public constructor(string: string) {
		this.string = string;
		this.textEncoder = new TextEncoder();
	}

	public getText(): string {
		return this.string;
	}

	public encode(textEncoding: TextEncoding = TextEncoding.UTF_8): ByteBuffer {
		switch (textEncoding) {
			case TextEncoding.ASCII:
				return this.encodeAscii();
			case TextEncoding.UTF_8:
				return this.encodeUTF8();
			case TextEncoding.UTF_16LE:
				return this.encodeUTF16LE();
			default:
				throw new Error("Unsupported text encoding.");
		}
	}

	private encodeAscii(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length);
		for (let i = 0; i < this.string.length; i++) {
			const charCode: number = this.string.charCodeAt(i);
			byteBuffer.set(i, charCode & 0x7F);
		}
		return byteBuffer;
	}

	private encodeUTF8(): ByteBuffer {
		const array: Uint8Array = this.textEncoder.encode(this.string);
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(array.length);
		for (let i = 0; i < array.length; i++) {
			byteBuffer.set(i, array[i]);
		}
		return byteBuffer;
	}

	private encodeUTF16LE(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length * 2);
		for (let i = 0; i < this.string.length; i++) {
			const position: number = i * 2;
			const charCode: number = this.string.charCodeAt(i);
			const low: number = charCode & 0xFF;
			const high: number = (charCode >>> 8) & 0xFF;
			byteBuffer.set(position, low);
			byteBuffer.set(position + 1, high);
		}
		return byteBuffer;
	}

}
