//
// Image.ts
//

import ByteBuffer from "../../memory/ByteBuffer.ts";

export default class Image {

	public readonly width: number;
	public readonly height: number;
	public readonly channels: number;
	public readonly data: ByteBuffer;

	public constructor(width: number, height: number, channels: number, data: ByteBuffer) {
		this.width = width;
		this.height = height;
		this.channels = channels;
		this.data = data;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getData() {
		return this.data;
	}

}
