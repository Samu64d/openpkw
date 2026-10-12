//
// Buffer.ts
//

import Capacity from "../../memory/Capacity.ts";

export default abstract class Buffer extends Capacity {

	public constructor(capacity: number, resizable: boolean = false) {
		super(capacity, resizable);
	}

	public isRangeWithinBounds(startPosition: number, endPosition: number): boolean {
		return startPosition >= 0 && startPosition <= endPosition && endPosition <= this.capacity;
	}

}
