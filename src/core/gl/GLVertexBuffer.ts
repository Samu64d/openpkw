//
// GLVertexBuffer.ts
//

import GLBuffer from "./GLBuffer.ts";
import GLContextManager from "./GLContextManager.ts";

export default class GLVertexBuffer extends GLBuffer {

	private static readonly TYPE_GLENUM_NAME: string = "ARRAY_BUFFER";

	public constructor(contextManager: GLContextManager) {
		super(contextManager, contextManager.enum(GLVertexBuffer.TYPE_GLENUM_NAME));
	}

}
