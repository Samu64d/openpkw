//
// GLVertexShader.ts
//

import GLShader from "./GLShader.ts";
import GLContextManager from "./GLContextManager.ts";

export default class GLVertexShader extends GLShader {

	private static readonly TYPE_GLENUM_NAME: string = "VERTEX_SHADER";

	public constructor(contextManager: GLContextManager, source: string) {
		super(contextManager, contextManager.enum(GLVertexShader.TYPE_GLENUM_NAME), source);
	}

}
