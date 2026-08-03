//
// GLBuffer.ts
//

import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
export default abstract class GLBuffer implements Disposable.Target {

	protected readonly contextManager: GLContextManager;
	protected readonly type: GLenum;
	protected readonly bufferObject: WebGLBuffer;

	public constructor(contextManager: GLContextManager, type: GLenum) {
		this.contextManager = contextManager;
		this.type = type;
		this.bufferObject = this.contextManager.getContext().createBuffer();
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getType(): GLenum {
		return this.type;
	}

	public getBufferObject(): WebGLBuffer {
		return this.bufferObject;
	}

	public bind(): void {
		this.contextManager.bindBuffer(this.type, this.bufferObject);
	}

	public isBound(): boolean {
		return this.contextManager.hasBufferBound(this.type, this.bufferObject);
	}

	public loadData(data: AllowSharedBufferSource, usage: string = "STATIC_DRAW"): void {
		if (this.isBound() == false) {
			throw new Error("Cannot load data into an unbound buffer.");
		}
		this.contextManager.getContext().bufferData(this.type, data, this.contextManager.enum(usage));
	}

	public unbind(): void {
		this.contextManager.unbindBuffer(this.type, this.bufferObject);
	}

	public dispose(): void {
		this.contextManager.getContext().deleteBuffer(this.bufferObject);
	}

}
