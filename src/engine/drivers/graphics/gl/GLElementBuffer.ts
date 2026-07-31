//
// GLElementBuffer.ts
//

import GLBuffer from "./GLBuffer.ts";
import GLContextManager from "./GLContextManager.ts";

export default class GLElementBuffer extends GLBuffer {

	private static readonly TYPE_GLENUM_NAME: string = "ELEMENT_ARRAY_BUFFER";

	public constructor(contextManager: GLContextManager) {
		super(contextManager, contextManager.enum(GLElementBuffer.TYPE_GLENUM_NAME));
	}

}
