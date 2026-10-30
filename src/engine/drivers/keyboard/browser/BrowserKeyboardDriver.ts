//
// BrowserKeyboardDriver.ts
//

import KeyboardDriver from "../../../core/interop/KeyboardDriver.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";

@Disposable()
export default class BrowserKeyboardDriver extends KeyboardDriver implements Disposable.Target {

	public constructor() {
		super();
	}

	public override init(): void {
	}

	public override dispose(): void {
	}

}
