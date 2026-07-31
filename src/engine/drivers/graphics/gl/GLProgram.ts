//
// GLProgram.ts
//

import Nullable from "../../../core/common/Nullable.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import GLShader from "./GLShader.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
class GLProgram implements Disposable.Target {

	private readonly contextManager: GLContextManager;
	private readonly programObject: WebGLProgram;
	private linkingStatus: GLProgram.LinkingStatus;
	private linkingError: Nullable<string>;

	public constructor(contextManager: GLContextManager) {
		this.contextManager = contextManager;
		this.programObject = contextManager.getContext().createProgram();
		this.linkingStatus = GLProgram.LinkingStatus.UNLINKED;
		this.linkingError = null;
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getProgramObject(): WebGLProgram {
		return this.programObject;
	}

	public getLinkingStatus(): GLProgram.LinkingStatus {
		return this.linkingStatus;
	}

	public attachShader(shader: GLShader): void {
		if (this.linkingStatus != GLProgram.LinkingStatus.UNLINKED) {
			throw new Error("Trying attach shader to a program that is already linked");
		}
		this.contextManager.getContext().attachShader(this.programObject, shader.getShaderObject());
	}

	public attachShaders(shaderList: GLShader[]): void {
		for (const shader of shaderList) {
			this.attachShader(shader);
		}
	}

	public link(): void {
		if (this.linkingStatus != GLProgram.LinkingStatus.UNLINKED) {
			return;
		}
		this.contextManager.getContext().linkProgram(this.programObject);
		this.updateLinkingStatus();
	}

	public getLinkingError(): Nullable<string> {
		if (this.linkingStatus != GLProgram.LinkingStatus.FAILED) {
			return null;
		}

		if (this.linkingError == null) {
			const infoLog: Nullable<string> = this.contextManager.getContext().getProgramInfoLog(this.programObject);
			if (infoLog != null && infoLog.length > 0) {
				this.linkingError = infoLog.replaceAll("\0", "");
			}
		}

		return this.linkingError;
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

	private updateLinkingStatus(): void {
		const linkingStatus: boolean = this.contextManager.getContext().getProgramParameter(this.programObject, this.contextManager.enum("LINK_STATUS"));
		if (linkingStatus == true) {
			this.linkingStatus = GLProgram.LinkingStatus.LINKED;
		} else {
			this.linkingStatus = GLProgram.LinkingStatus.FAILED;
		}
	}

}

namespace GLProgram {

	export const enum LinkingStatus {
		UNLINKED,
		LINKED,
		FAILED
	}

}

export default GLProgram;
