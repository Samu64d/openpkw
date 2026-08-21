//
// PNGChunk.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class PNGChunk {

	private static readonly SIGNATURE_TO_STRING: (signature: number) => string = (signature: number): string => {
		return String.fromCharCode((signature >>> 24) & 0xFF, (signature >>> 16) & 0xFF, (signature >>> 8) & 0xFF, signature & 0xFF);
	};

	private readonly size: number;
	private readonly signature: number;
	private readonly data: ByteBuffer;
	private readonly crc: number;

	public constructor(size: number, signature: number, data: ByteBuffer, crc: number) {
		this.size = size;
		this.signature = signature;
		this.data = data;
		this.crc = crc;
	}

	public getSize(): number {
		return this.size;
	}

	public getSignature(): number {
		return this.signature;
	}

	public getData(): ByteBuffer {
		return this.data;
	}

	public getCrc(): number {
		return this.crc;
	}

	public getSignatureAsString(): string {
		return PNGChunk.SIGNATURE_TO_STRING(this.signature);
	}

	public equals(other: PNGChunk): boolean {
		return this.size == other.size && this.signature == other.signature && this.crc == other.crc && this.data.equals(other.data);
	}

}
