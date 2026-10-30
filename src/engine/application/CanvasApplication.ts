//
// CanvasApplication.ts
//

import Nullable from "../core/common/Nullable.ts";
import Function from "../core/common/Function.ts";
import BiFunction from "../core/common/BiFunction.ts";
import Exception from "../core/exception/Exception.ts";
import BrowserApplication from "./BrowserApplication.ts";

abstract class CanvasApplication extends BrowserApplication {

	public static readonly FIXED_RESOLUTION: BiFunction<number, number, CanvasApplication.ResolutionAdapter> = (width: number, height: number): CanvasApplication.ResolutionAdapter => {
		return new CanvasApplication.FixedResolutionAdapter(width, height);
	};

	public static readonly ADAPTIVE_RESOLUTION: Function<number, CanvasApplication.ResolutionAdapter> = (scaleFactor: number): CanvasApplication.ResolutionAdapter => {
		return new CanvasApplication.AdaptiveResolutionAdapter(scaleFactor);
	};

	private static readonly DEFAULT_CANVAS_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
		alpha: false,
		depth: true,
		powerPreference: "high-performance"
	};

	private resolutionAdapter: CanvasApplication.ResolutionAdapter;
	private readonly antialiasing: boolean;
	private canvasElement: HTMLCanvasElement;
	private canvasContext: Nullable<WebGL2RenderingContext>;

	public constructor(resolutionAdapter: CanvasApplication.ResolutionAdapter, antialiasing: boolean = false) {
		super();

		this.resolutionAdapter = resolutionAdapter;
		this.antialiasing = antialiasing;
		this.canvasElement = this.browserDocument.createElement("canvas");
		this.canvasElement.style.width = "100%";
		this.canvasElement.style.height = "100%";
		this.canvasContext = null;
	}

	public getResolutionAdapter(): CanvasApplication.ResolutionAdapter {
		return this.resolutionAdapter;
	}

	public setResolutionAdapter(resolutionAdapter: CanvasApplication.ResolutionAdapter): void {
		this.resolutionAdapter = resolutionAdapter;
		this.updateCanvasSize();
	}

	public getAntialiasing(): boolean {
		return this.antialiasing;
	}

	public getCanvasWidth(): number {
		return this.canvasElement.width;
	}

	public setCanvasWidth(width: number): void {
		this.canvasElement.width = width;
	}

	public getCanvasHeight(): number {
		return this.canvasElement.height;
	}

	public setCanvasHeight(height: number): void {
		this.canvasElement.height = height;
	}

	public abstract onCanvasResize(width: number, height: number): void;

	public getRenderingContext(): Nullable<WebGL2RenderingContext> {
		return this.canvasContext;
	}

	public abstract onRenderingContextLost(): void;

	public abstract onRenderingContextRestored(): void;

	protected override onLoadListener(): void {
		this.setupCanvas();
		super.onLoadListener();
	}

	protected override onResizeListener(): void {
		this.updateCanvasSize();
		super.onResizeListener();
	}

	private updateCanvasSize(): void {
		this.resolutionAdapter.adapt(this);

		const width: number = this.getCanvasWidth();
		const height: number = this.getCanvasHeight();

		this.onCanvasResize(width, height);
	}

	private setupCanvas(): void {
		this.browserDocument.appendNodeToBody(this.canvasElement);

		this.canvasElement.addEventListener("contextlost", this.onRenderingContextLost.bind(this));
		this.canvasElement.addEventListener("contextrestored", this.onRenderingContextRestored.bind(this));
		this.updateCanvasSize();

		const attributes: WebGLContextAttributes = {
			...CanvasApplication.DEFAULT_CANVAS_CONTEXT_ATTRIBUTES,
			antialias: this.antialiasing
		};

		this.canvasContext = this.canvasElement.getContext("webgl2", attributes);

		if (this.canvasContext == null) {
			throw new Exception("Cannot access canvas WEBGL2 rendering context");
		}
	}

}

namespace CanvasApplication {

	export interface ResolutionAdapter {

		adapt(canvasApplication: CanvasApplication): void;

	}

	export class FixedResolutionAdapter implements ResolutionAdapter {

		private readonly width: number;
		private readonly height: number;

		public constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
		}

		public adapt(canvasApplication: CanvasApplication): void {
			canvasApplication.setCanvasWidth(this.width);
			canvasApplication.setCanvasHeight(this.height);
		}

	}

	export class AdaptiveResolutionAdapter implements ResolutionAdapter {

		private readonly scaleFactor: number;

		public constructor(scaleFactor: number = 1.0) {
			this.scaleFactor = scaleFactor;
		}

		public adapt(canvasApplication: CanvasApplication): void {
			const width: number = Math.floor(canvasApplication.getClientWidth() * this.scaleFactor);
			const height: number = Math.floor(canvasApplication.getClientHeight() * this.scaleFactor);

			canvasApplication.setCanvasWidth(width);
			canvasApplication.setCanvasHeight(height);
		}

	}

}

export default CanvasApplication;
