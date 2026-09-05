//
// IDATData.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class IDATData {

	private readonly imageData: ByteBuffer;

	public constructor(imageData: ByteBuffer) {
		this.imageData = imageData;
	}

	public getImageData(): ByteBuffer {
		return this.imageData;
	}

}
