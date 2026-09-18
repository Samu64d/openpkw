//
// IHDRData.ts
//

import Record from "../../../reflection/decorators/Record.ts";
import ColorType from "../image/ColorType.ts";

@Record()
export default class IHDRData {

	private readonly width: number;
	private readonly height: number;
	private readonly depth: number;
	private readonly colorType: number;
	private readonly compressionMethod: number;
	private readonly filterMethod: number;
	private readonly interlaceMethod: number;

	public constructor(width: number, height: number, depth: number, colorType: ColorType, compressionMethod: number, filterMethod: number, interlaceMethod: number) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.colorType = colorType;
		this.compressionMethod = compressionMethod;
		this.filterMethod = filterMethod;
		this.interlaceMethod = interlaceMethod;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getDepth(): number {
		return this.depth;
	}

	public getColorType(): ColorType {
		return this.colorType;
	}

	public getCompressionMethod(): number {
		return this.compressionMethod;
	}

	public getFilterMethod(): number {
		return this.filterMethod;
	}

	public getInterlaceMethod(): number {
		return this.interlaceMethod;
	}

}
