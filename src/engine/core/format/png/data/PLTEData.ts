//
// PLTEData.ts
//

import ByteBuffer from "../../../memory/ByteBuffer.ts";
import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class PLTEData {

	private readonly paletteData: ByteBuffer;

	public constructor(paletteData: ByteBuffer) {
		this.paletteData = paletteData;
	}

	public getPaletteData(): ByteBuffer {
		return this.paletteData;
	}

}
