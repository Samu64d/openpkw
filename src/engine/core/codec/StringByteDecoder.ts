//
// StringByteDecoder.ts
//

import TextEncoding from "../memory/TextEncoding.ts";
import ByteBuffer from "../memory/ByteBuffer.ts";
import Decoder from "./Decoder.ts";

export default class StringByteDecoder implements Decoder<string> {

	private static readonly READ_CHUNK_SIZE: number = 8192;

	private static readonly UTF_8_DECODER: TextDecoder = new TextDecoder("utf-8", {
		fatal: true
	});

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

	public decode(source: ByteBuffer): string {
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

	private decodeAscii(source: ByteBuffer): string {
		const sizeInBytes: number = source.getSize();
		const src: Uint8Array = source.unsafeGetData();
		let dest: string = "";

		for (let i: number = 0; i < sizeInBytes; i += StringByteDecoder.READ_CHUNK_SIZE) {
			const end: number = Math.min(i + StringByteDecoder.READ_CHUNK_SIZE, sizeInBytes);
			const charCodeList: Uint8Array = new Uint8Array(end - i);

			for (let j: number = i; j < end; j++) {
				const charCode: number = src[j];
				if (charCode > 0x7F) {
					throw new Error("Encountered incorrect byte value to be decoded: " + charCode + ".");
				}
				charCodeList[j - i] = charCode;
			}

			dest += String.fromCharCode(...charCodeList);
		}

		return dest;
	}

	private decodeUtf8(source: ByteBuffer): string {
		const src: Uint8Array = source.unsafeGetData();
		return StringByteDecoder.UTF_8_DECODER.decode(src);
	}

	private decodeUtf16LE(source: ByteBuffer): string {
		if (source.getSize() % 2 != 0) {
			throw new Error("Byte buffer to be decoded has incorrect size: " + source.getSize() + ".");
		}

		const sizeInBytes: number = source.getSize() / 2;
		const src: Uint8Array = source.unsafeGetData();
		let dest: string = "";

		for (let i: number = 0; i < sizeInBytes; i += StringByteDecoder.READ_CHUNK_SIZE) {
			const end: number = Math.min(i + StringByteDecoder.READ_CHUNK_SIZE, sizeInBytes);
			const charCodeList: Uint16Array = new Uint16Array(end - i);

			for (let j: number = i; j < end; j++) {
				const low: number = src[j * 2];
				const high: number = src[j * 2 + 1];
				const charCode: number = low | (high << 8);

				charCodeList[j - i] = charCode;
			}

			dest += String.fromCharCode(...charCodeList);
		}

		return dest;
	}

}
