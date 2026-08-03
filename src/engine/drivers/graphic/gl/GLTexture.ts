//
// GLTexture.ts
//

import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import GLContextManager from "./GLContextManager.ts";

@Disposable()
export default class GLTexture implements Disposable.Target {

	private readonly contextManager: GLContextManager;
	private readonly type: GLenum;
	private readonly textureObject: WebGLTexture;

	public constructor(contextManager: GLContextManager, type: GLenum) {
		this.contextManager = contextManager;
		this.type = type;
		this.textureObject = contextManager.getContext().createTexture();
	}

	public getContextManager(): GLContextManager {
		return this.contextManager;
	}

	public getType(): GLenum {
		return this.type;
	}

	public getTextureObject(): WebGLTexture {
		return this.textureObject;
	}

	public bind(): void {
		this.contextManager.bindTexture(this.type, this.textureObject);
	}

	public isBound(): boolean {
		return this.contextManager.hasTextureBound(this.type, this.textureObject);
	}

	public loadImageData(width: number, height: number, data: ArrayBufferView<ArrayBufferLike>): void {
		if (this.isBound() == false) {
			throw new Error("Try loading image data on a texture that was not bound.");
		}
		this.contextManager.getContext().texImage2D(this.type, 0, this.contextManager.enum("RGB"), width, height, 0, this.contextManager.enum("RGB"), this.contextManager.enum("UNSIGNED_BYTE"), data);
	}

	public generateMipmap(): void {
		if (this.isBound() == false) {
			throw new Error("Try generating mipmap of a texture that was not bound.");
		}
		this.contextManager.getContext().generateMipmap(this.type);
	}

	public unbind(): void {
		this.contextManager.unbindTexture(this.type, this.textureObject);
	}

	public dispose(): void {
		this.contextManager.getContext().deleteTexture(this.textureObject);
	}

}
