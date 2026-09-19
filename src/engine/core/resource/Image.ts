//
// Image.ts
//

import ByteBuffer from "../memory/ByteBuffer.ts";
import Record from "../reflection/decorators/Record.ts";

@Record()
export default class Image {

	public static readonly FROM_RGBA: (width: number, height: number, rgbaData: ByteBuffer) => Image = (width: number, height: number, rgbaData: ByteBuffer): Image => {
		return new Image(width, height, rgbaData);
	}

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

}
