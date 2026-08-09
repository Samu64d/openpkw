// 
// Area.ts
//

import Record from "../../reflection/decorators/Record.ts";

@Record()
export default class Area {

	private readonly width: number;
	private readonly height: number;
	private readonly value: number;

	public constructor(width: number, height: number) {
		if (width < 0 || height < 0) {
			throw new Error("Width and height values must be non negative.");
		}

		this.width = width;
		this.height = height;
		this.value = width * height;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	public getValue(): number {
		return this.value;
	}

	public equals(area: Area): boolean {
		return this.width == area.width && this.height == area.height;
	}

}
