//
// Area.ts
//

import Record from "../../reflection/decorators/Record.ts";
import ArgumentOutOfRangeException from "../../exception/ArgumentOutOfRangeException.ts";

@Record()
export default class Area {

	private readonly width: number;
	private readonly height: number;
	private readonly size: number;

	public constructor(width: number, height: number) {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(width, 0, "width");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(height, 0, "height");

		this.width = width;
		this.height = height;
		this.size = width * height;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getSize(): number {
		return this.size;
	}

	public equals(area: Area): boolean {
		return this === area || (this.width == area.width && this.height == area.height);
	}

}
