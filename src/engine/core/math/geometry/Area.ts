// 
// Area.ts
//

import Record from "../../reflection/decorators/Record.ts";

@Record()
export default class Area {

	private readonly width: number;
	private readonly height: number;
	private readonly size: number;

	public constructor(width: number, height: number) {
		if (width < 1 || height < 1) {
			throw new Error("Width and height values must be at least 1: got width " + width + ", height " + height + ".");
		}

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
