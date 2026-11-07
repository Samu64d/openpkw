//
// Image.ts
//

import ByteBuffer from "../io/buffer/ByteBuffer.ts";
import Record from "../reflection/decorators/Record.ts";
import Exception from "../exception/Exception.ts";

@Record()
export default class Image {

	private static readonly PIXEL_BYTE_SIZE: number = 4;

	private readonly width: number;
	private readonly height: number;
	private readonly data: ByteBuffer;

	public constructor(width: number, height: number, data: ByteBuffer) {
		this.width = width;
		this.height = height;
		this.data = data;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getData(): ByteBuffer {
		return this.data;
	}

	public slice(x: number, y: number, width: number, height: number): Image {
		if (x < 0 || x + width > this.width || y < 0 || y + height > this.height) {
			throw new Exception("Slice bounds must be inside image bounds");
		}

		const src: Uint8Array = this.data.unsafeGetSourceView();
		const size: number = width * height * Image.PIXEL_BYTE_SIZE;
		const byteBuffer: ByteBuffer = ByteBuffer.ALLOCATE(size);
		const dest: Uint8Array = byteBuffer.unsafeGetSourceView();
		let destIndex: number = 0;

		for (let y0: number = y; y0 < y + height; y0++) {
			for (let x0: number = x; x0 < x + width; x0++) {
				const srcIndex: number = (y0 * this.width + x0) * Image.PIXEL_BYTE_SIZE;

				dest[destIndex] = src[srcIndex];
				dest[destIndex + 1] = src[srcIndex + 1];
				dest[destIndex + 2] = src[srcIndex + 2];
				dest[destIndex + 3] = src[srcIndex + 3];
				destIndex += 4;
			}
		}

		return new Image(width, height, byteBuffer);
	}

}
