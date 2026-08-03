//
// StringByteEncoder.ts
//

import TextEncoding from "./TextEncoding.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class StringByteEncoder {

	private readonly string: string;

	public constructor(string: string) {
		this.string = string;
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
			case TextEncoding.UTF_16:
				return this.encodeUTF16();
			default:
				throw new Error("Unsupported text encoding.");
		}
	}

	private encodeAscii(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length);
		for (let i = 0; i < this.string.length; i++) {
			byteBuffer.set(i, this.string.charCodeAt(i) & 0xFF);
		}
		return byteBuffer;
	}

	private encodeUTF8(): ByteBuffer {
		const array: Uint8Array = new globalThis.TextEncoder().encode(this.string);
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(array.length);
		for (let i = 0; i < array.length; i++) {
			byteBuffer.set(i, array[i]);
		}
		return byteBuffer;
	}

	private encodeUTF16(): ByteBuffer {
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(this.string.length * 2);
		const dataView: DataView = new DataView(byteBuffer.data.buffer);
		for (let i = 0; i < this.string.length; i++) {
			dataView.setUint16(i * 2, this.string.charCodeAt(i), true);
		}
		return byteBuffer;
	}

}
