//
// tRNSData.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class tRNSData {

	private readonly transparencyData: ByteBuffer;

	public constructor(transparencyData: ByteBuffer) {
		this.transparencyData = transparencyData;
	}

	public getTransparencyData(): ByteBuffer {
		return this.transparencyData;
	}

}
