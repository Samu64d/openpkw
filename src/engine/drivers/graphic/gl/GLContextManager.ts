//
// GLContextManager.ts
//

import Nullable from "../../../core/common/Nullable.ts";
import Color from "../../../core/rendering/Color.ts";
import Colors from "../../../core/rendering/Colors.ts";

export default class GLContextManager {

	private readonly context: WebGL2RenderingContext;
	private readonly boundBufferMap: Map<GLenum, Nullable<WebGLBuffer>>;
	private readonly boundTextureMap: Map<GLenum, Nullable<WebGLTexture>>;
	private boundVertexArray: Nullable<WebGLVertexArrayObject>;
	private boundProgram: Nullable<WebGLProgram>;

	public constructor(context: WebGL2RenderingContext) {
		this.context = context;
		this.boundBufferMap = new Map<GLenum, Nullable<WebGLBuffer>>();
		this.boundTextureMap = new Map<GLenum, Nullable<WebGLTexture>>();
		this.boundVertexArray = null;
		this.boundProgram = null;
	}

	public getContext(): WebGL2RenderingContext {
		return this.context;
	}

	/**
	 * @todo GLEnum class
	 * @deprecated
	 */
	public enum(name: string): number {
		return (this.context as any)[name];
	}

	public isContextLost(): boolean {
		return this.context.isContextLost();
	}

	public setViewport(width: number, height: number): void {
		this.context.viewport(0, 0, width, height);
	}

	public enableDepthTest(): void {
		this.context.enable(this.context.DEPTH_TEST);
	}

	public disableDepthTest(): void {
		this.context.disable(this.context.DEPTH_TEST);
	}

	public enableBlend(): void {
		this.context.enable(this.context.BLEND);
	}

	public disableBlend(): void {
		this.context.disable(this.context.BLEND);
	}

	public setAlphaBlend(): void {
		this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
	}

	public clear(clearColor: Color.Immutable = Colors.WHITE): void {
		this.context.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
	}

	public hasBufferBound(type: GLenum, buffer: WebGLBuffer): boolean {
		return this.boundBufferMap.get(type) == buffer;
	}

	public bindBuffer(type: GLenum, buffer: WebGLBuffer): void {
		if (this.hasBufferBound(type, buffer) == true) {
			return;
		}
		this.context.bindBuffer(type, buffer);
		this.boundBufferMap.set(type, buffer);
	}

	public unbindBuffer(type: GLenum, buffer: WebGLBuffer): void {
		if (this.hasBufferBound(type, buffer) == false) {
			return;
		}
		this.context.bindBuffer(type, null);
		this.boundBufferMap.set(type, null);
	}

	public hasVertexArrayBound(vertexArray: WebGLVertexArrayObject): boolean {
		return this.boundVertexArray == vertexArray;
	}

	public bindVertexArray(vertexArray: WebGLVertexArrayObject): void {
		if (this.hasVertexArrayBound(vertexArray) == true) {
			return;
		}
		this.context.bindVertexArray(vertexArray);
		this.boundVertexArray = vertexArray;
	}

	public unbindVertexArray(vertexArray: WebGLVertexArrayObject): void {
		if (this.hasVertexArrayBound(vertexArray) == false) {
			return;
		}
		this.context.bindVertexArray(null);
		this.boundVertexArray = null;
	}

	public hasProgramBound(program: WebGLProgram): boolean {
		return this.boundProgram == program;
	}

	public hasTextureBound(type: GLenum, texture: WebGLTexture): boolean {
		return this.boundTextureMap.get(type) == texture;
	}

	public bindTexture(type: GLenum, texture: WebGLTexture): void {
		if (this.hasTextureBound(type, texture) == true) {
			return;
		}
		this.context.bindTexture(type, texture);
		this.boundTextureMap.set(type, texture);
	}

	public unbindTexture(type: GLenum, texture: WebGLTexture): void {
		if (this.hasTextureBound(type, texture) == false) {
			return;
		}
		this.context.bindTexture(type, null);
		this.boundTextureMap.set(type, null);
	}

	public bindProgram(program: WebGLProgram): void {
		if (this.hasProgramBound(program) == true) {
			return;
		}
		this.context.useProgram(program);
		this.boundProgram = program;
	}

	public unbindProgram(program: WebGLProgram): void {
		if (this.hasProgramBound(program) == false) {
			return;
		}
		this.context.useProgram(null);
		this.boundProgram = null;
	}

}
