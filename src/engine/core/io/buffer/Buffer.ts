//
// Buffer.ts
//

import Capacity from "../../memory/Capacity.ts";

export default abstract class Buffer extends Capacity {

	public constructor(capacity: number, resizable: boolean = false) {
		super(capacity, resizable);
	}

}
