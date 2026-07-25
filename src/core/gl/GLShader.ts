//
// GLShader.ts
//

import Nullable from "../foundation/Nullable.ts";
import Disposable from "../reflection/decorators/Disposable.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
abstract class GLShader {

	private readonly contextManager: GLContextManager;
	private readonly type: GLenum;
	private readonly shaderObject: WebGLShader;
	private readonly source: string;
	private compilationStatus: GLShader.CompilationStatus;
	private compilationError: Nullable<string>;

	public constructor(contextManager: GLContextManager, type: GLenum, source: string) {
		this.contextManager = contextManager;
		this.type = type;
		const shaderObject: Nullable<WebGLShader> = contextManager.getContext().createShader(type);
		if (shaderObject == null) {
			throw new Error("Unable to create shader.");
		}
		this.shaderObject = shaderObject;
		this.source = source;
		this.compilationStatus = GLShader.CompilationStatus.UNCOMPILED;
		this.compilationError = null;
		this.contextManager.getContext().shaderSource(this.shaderObject, this.source);
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getType(): GLenum {
		return this.type;
	}

	public getSource(): string {
		return this.source;
	}

	public getShaderObject(): WebGLShader {
		return this.shaderObject;
	}

	public getCompilationStatus(): GLShader.CompilationStatus {
		return this.compilationStatus;
	}

	public compile(): void {
		if (this.compilationStatus != GLShader.CompilationStatus.UNCOMPILED) {
			return;
		}
		this.contextManager.getContext().compileShader(this.shaderObject);
		this.updateCompilationStatus();
	}

	public getCompilationError(): Nullable<string> {
		if (this.compilationStatus != GLShader.CompilationStatus.FAILED) {
			return null;
		}

		if (this.compilationError == null) {
			const infoLog: Nullable<string> = this.contextManager.getContext().getShaderInfoLog(this.shaderObject);
			if (infoLog != null && infoLog.length > 0) {
				this.compilationError = infoLog.replaceAll("\0", "");
			}
		}

		return this.compilationError;
	}

	public dispose(): void {
		this.contextManager.getContext().deleteShader(this.shaderObject);
	}

	private updateCompilationStatus(): void {
		const compileStatus: boolean = this.contextManager.getContext().getShaderParameter(this.shaderObject, this.contextManager.enum("COMPILE_STATUS"));
		if (compileStatus == true) {
			this.compilationStatus = GLShader.CompilationStatus.COMPILED;
		} else {
			this.compilationStatus = GLShader.CompilationStatus.FAILED;
		}
	}

}

namespace GLShader {

	export const enum CompilationStatus {
		UNCOMPILED,
		COMPILED,
		FAILED
	}

}

export default GLShader;
