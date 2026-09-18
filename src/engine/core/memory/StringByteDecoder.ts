//
// StringByteDecoder.ts
//

import TextEncoding from "./TextEncoding.ts";
import ByteBuffer from "./ByteBuffer.ts";

export default class StringByteDecoder {

	private static readonly SCAN_CHUNK_SIZE: number = 8192;

	private static readonly UTF_8_DECODER: TextDecoder = new TextDecoder("utf-8", {
		fatal: true
	});

	private readonly byteBuffer: ByteBuffer;

	public constructor(byteBuffer: ByteBuffer) {
		this.byteBuffer = byteBuffer;
	}

	public getByteBuffer(): ByteBuffer {
		return this.byteBuffer;
	}

	public decode(textEncoding: TextEncoding = TextEncoding.UTF_8): string {
		switch (textEncoding) {
			case TextEncoding.ASCII:
				{
					return this.decodeAscii();
				}
			case TextEncoding.UTF_8:
				{
					return this.decodeUtf8();
				}
			case TextEncoding.UTF_16LE:
				{
					return this.decodeUtf16LE();
				}
			default:
				{
					throw new Error("Unknown text encoding.");
				}
		}
	}

	private decodeAscii(): string {
		const size: number = this.byteBuffer.getSize();
		let string: string = "";

		for (let i: number = 0; i < size; i += StringByteDecoder.SCAN_CHUNK_SIZE) {
			const end: number = Math.min(i + StringByteDecoder.SCAN_CHUNK_SIZE, size);
			const charCodeList: number[] = new Array<number>(end - i);
			for (let j: number = i; j < end; j++) {
				const charCode: number = this.byteBuffer.get(j);
				if (charCode > 0x7F) {
					throw new Error("Encountered incorrect byte buffer value to be decoded.");
				}
				charCodeList[j - i] = charCode;
			}
			string += String.fromCharCode(...charCodeList);
		}

		return string;
	}

	private decodeUtf8(): string {
		return StringByteDecoder.UTF_8_DECODER.decode(this.byteBuffer.unsafeGetData());
	}

	private decodeUtf16LE(): string {
		if (this.byteBuffer.getSize() % 2 != 0) {
			throw new Error("Byte buffer to be decoded has incorrect size.");
		}

		const size: number = this.byteBuffer.getSize() / 2;
		let string: string = "";

		for (let i: number = 0; i < size; i += StringByteDecoder.SCAN_CHUNK_SIZE) {
			const end: number = Math.min(i + StringByteDecoder.SCAN_CHUNK_SIZE, size);
			const charCodeList: number[] = new Array<number>(end - i);
			for (let j: number = i; j < end; j++) {
				const low: number = this.byteBuffer.get(j * 2);
				const high: number = this.byteBuffer.get(j * 2 + 1);
				const charCode: number = low | (high << 8);
				charCodeList[j - i] = charCode;
			}
			string += String.fromCharCode(...charCodeList);
		}

		return string;
	}

}
