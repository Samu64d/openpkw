//
// GLFragmentShader.ts
//

import GLShader from "./GLShader.ts";
import GLContextManager from "./GLContextManager.ts";

export default class GLFragmentShader extends GLShader {

	private static readonly TYPE_GLENUM_NAME: string = "FRAGMENT_SHADER";

	public constructor(contextManager: GLContextManager, source: string) {
		super(contextManager, contextManager.enum(GLFragmentShader.TYPE_GLENUM_NAME), source);
	}

}
