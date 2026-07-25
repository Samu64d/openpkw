//
// GLProgram.ts
//

import Nullable from "../foundation/Nullable.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import GLShader from "./GLShader.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
export default class GLProgram {

	private readonly contextManager: GLContextManager;
	private readonly programObject: WebGLProgram;

	public constructor(contextManager: GLContextManager) {
		this.contextManager = contextManager;
		this.programObject = contextManager.getContext().createProgram();
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getProgramObject(): WebGLProgram {
		return this.programObject;
	}

	public attachShader(shader: GLShader): void {
		this.contextManager.getContext().attachShader(this.programObject, shader.getShaderObject());
	}

	public attachShaders(shaderList: GLShader[]): void {
		for (const shader of shaderList) {
			this.attachShader(shader);
		}
	}

	public link(): void {
		this.contextManager.getContext().linkProgram(this.programObject);
	}

	public getLinkingError(): Nullable<string> {
		const linkedStatus: boolean = this.contextManager.getContext().getProgramParameter(this.programObject, this.contextManager.enum("LINK_STATUS"));
		if (linkedStatus == false) {
			const infoLog: Nullable<string> = this.contextManager.getContext().getProgramInfoLog(this.programObject);
			if (infoLog != null && infoLog.length > 0) {
				return infoLog.replaceAll("\0", "");
			}
		}
		return null;
	}

	public use(): void {
		this.contextManager.bindProgram(this.programObject);
	}

	public unuse(): void {
		this.contextManager.unbindProgram(this.programObject);
	}

	public dispose(): void {
		this.contextManager.getContext().deleteProgram(this.programObject);
	}

}
