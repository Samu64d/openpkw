//
// MappedBuffer.ts
//

import Disposable from "../../reflection/decorators/Disposable.ts";
import Buffer from "./Buffer.ts";

@Disposable()
export default class MappedBuffer extends Buffer implements Disposable.Target {

	public constructor(size: number) {
		super(size, true);
	}

	public dispose(): void {
	}

}
