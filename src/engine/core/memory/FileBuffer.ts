//
// FileBuffer.ts
//

import Disposable from "../reflection/decorators/Disposable.ts";
import Buffer from "./Buffer.ts";

@Disposable()
export default class FileBuffer extends Buffer<number> implements Disposable.Target {

	public constructor(size: number) {
		super(size, true);
	}

	public dispose(): void {
	}

}
