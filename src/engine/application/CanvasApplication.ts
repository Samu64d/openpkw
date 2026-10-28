//
// CanvasApplication.ts
//

import Nullable from "../core/common/Nullable.ts";
import Exception from "../core/exception/Exception.ts";
import Application from "./Application.ts";

export default abstract class CanvasApplication extends Application {

	private static readonly DEFAULT_CANVAS_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
		alpha: false,
		depth: true
	};

	private readonly antialiasing: boolean;
	private canvasElement: Nullable<HTMLCanvasElement>;
	private canvasContext: Nullable<WebGL2RenderingContext>;

	public constructor(antialiasing: boolean = false) {
		super();

		this.antialiasing = antialiasing;
		this.canvasElement = null;
		this.canvasContext = null;
	}

	public getRenderingContext(): Nullable<WebGL2RenderingContext> {
		return this.canvasContext;
	}

	protected override onLoadListener(): void {
		this.setupCanvas();
		super.onLoadListener();
	}

	protected override onResizeListener(): void {
		if (this.canvasElement != null) {
			this.canvasElement.width = this.getClientWidth();
			this.canvasElement.height = this.getClientHeight();
		}

		super.onResizeListener();
	}

	private setupCanvas(): void {
		this.canvasElement = this.getDocument().createElement("canvas");
		this.canvasElement.width = this.getClientWidth();
		this.canvasElement.height = this.getClientHeight();
		this.getDocument().body.appendChild(this.canvasElement);

		const attributes: WebGLContextAttributes = {
			...CanvasApplication.DEFAULT_CANVAS_CONTEXT_ATTRIBUTES,
			antialias: this.antialiasing
		};

		this.canvasContext = this.canvasElement.getContext("webgl2", attributes);

		if (this.canvasContext == null) {
			throw new Exception("Cannot create canvas rendering context");
		}
	}

}
