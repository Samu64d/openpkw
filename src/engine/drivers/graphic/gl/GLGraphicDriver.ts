//
// GLGraphicDriver.ts
//

import GraphicDriver from "../../../core/interop/GraphicDriver.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";

@Disposable()
export default class GLGraphicDriver extends GraphicDriver implements Disposable.Target {

	public constructor() {
		super();
	}

	public override init(): void {
	}

	public override dispose(): void {
	}

}
