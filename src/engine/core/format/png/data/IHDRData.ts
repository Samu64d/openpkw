//
// IHDRData.ts
//

import Record from "../../../reflection/decorators/Record.ts";

@Record()
export default class IHDRData {

	private readonly width: number;
	private readonly height: number;
	private readonly depth: number;
	private readonly colorType: number;
	private readonly compressionType: number;
	private readonly filterType: number;
	private readonly interlaceType: number;

	public constructor(width: number, height: number, depth: number, colorType: number, compressionType: number, filterType: number, interlaceType: number) {
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.colorType = colorType;
		this.compressionType = compressionType;
		this.filterType = filterType;
		this.interlaceType = interlaceType;
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

	public getColorType(): number {
		return this.colorType;
	}

	public getCompressionType(): number {
		return this.compressionType;
	}

	public getFilterType(): number {
		return this.filterType;
	}

	public getInterlaceType(): number {
		return this.interlaceType;
	}

}
