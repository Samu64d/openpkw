//
// GLVertexArray.ts
//

import Nullable from "../../../core/common/Nullable.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import GLBuffer from "./GLBuffer.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
export default class GLVertexArray implements Disposable.Target {

	private readonly contextManager: GLContextManager;
	private readonly vertexArrayObject: WebGLVertexArrayObject;
	private readonly boundBufferMap: Map<GLenum, Nullable<GLBuffer>>;

	public constructor(contextManager: GLContextManager) {
		this.contextManager = contextManager;
		this.vertexArrayObject = this.contextManager.getContext().createVertexArray();
		this.boundBufferMap = new Map<GLenum, Nullable<GLBuffer>>();
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getArrayObject(): WebGLVertexArrayObject {
		return this.vertexArrayObject;
	}

	public bind(): void {
		this.contextManager.bindVertexArray(this.vertexArrayObject);
	}

	public isBound(): boolean {
		return this.contextManager.hasVertexArrayBound(this.vertexArrayObject);
	}

	public bindBuffer(buffer: GLBuffer): void {
		if (this.isBound() == false) {
			throw new Error("Try binding buffer to a vertex array that was not bound.");
		}
		buffer.unbind();
		buffer.bind();
		this.boundBufferMap.set(buffer.getType(), buffer);
	}

	public unbindBuffer(buffer: GLBuffer): void {
		if (this.isBound() == false) {
			throw new Error("Try binding buffer to a vertex array that was not bound.");
		}
		buffer.bind();
		buffer.unbind();
		this.boundBufferMap.set(buffer.getType(), null);
	}

	public getBoundBuffer(type: GLenum): Nullable<GLBuffer> {
		return this.boundBufferMap.get(type) ?? null;
	}

	public setAndEnableVertexAttribute(location: number, size: number,): void {
		if (this.isBound() == false) {
			throw new Error("Try set vertex attribute on buffer that was not bound.");
		}
		this.contextManager.getContext().vertexAttribPointer(location, size, this.contextManager.enum("FLOAT"), false, 6 * 4, 0);
		this.contextManager.getContext().enableVertexAttribArray(location);
	}

	public unbind(): void {
		this.contextManager.unbindVertexArray(this.vertexArrayObject);
	}

	public dispose(): void {
		this.contextManager.getContext().deleteVertexArray(this.vertexArrayObject);
	}

}
