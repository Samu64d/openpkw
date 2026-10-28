//
// Application.ts
//

import Nullable from "../core/common/Nullable.ts";
import EventListener from "../core/common/EventListener.ts";
import Exception from "../core/exception/Exception.ts";
import InvalidOperationException from "../core/exception/InvalidOperationException.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";

export default abstract class Application {

	private static readonly CANVAS_ELEMENT_ID: string = "canvas";

	private static readonly DEFAULT_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
		alpha: false,
		antialias: false,
		depth: true,
		premultipliedAlpha: true
	};

	private readonly electronIPC: ElectronIPC;
	private readonly ipcErrorChannel: IPCErrorChannel;
	private readonly document: Document;
	private documentReady: boolean;
	private documentError: boolean;
	private renderingCanvas: Nullable<HTMLCanvasElement>;
	private renderingContext: Nullable<WebGL2RenderingContext>;

	protected constructor() {
		this.electronIPC = ElectronIPC.FROM_GLOBAL_REFERENCE();
		this.ipcErrorChannel = new IPCErrorChannel(this.electronIPC);
		this.document = window.document;
		this.documentReady = false;
		this.documentError = false;
		this.renderingCanvas = null;
		this.renderingContext = null;
		this.registerWindowEventListeners();
	}

	public isReady(): boolean {
		return this.documentReady;
	}

	public abstract onInit(): void;

	public getClientWidth(): number {
		if (this.documentReady == false) {
			throw new InvalidOperationException("Application is not ready");
		}

		return Math.floor(this.document.body.clientWidth);
	}

	public getClientHeight(): number {
		if (this.documentReady == false) {
			throw new InvalidOperationException("Application is not ready");
		}

		return Math.floor(this.document.body.clientHeight);
	}

	public abstract onClientResize(width: number, height: number): void;

	public getRenderingContext(): Nullable<WebGL2RenderingContext> {
		return this.renderingContext;
	}

	public hasError(): boolean {
		return this.documentError;
	}

	public abstract onError(e: unknown): void;

	private registerWindowEventListener<T>(eventName: any, listener: EventListener<T>): void {
		window.addEventListener(eventName, listener);
	}

	private setupRenderingCanvasAndContext(): void {
		this.renderingCanvas = this.document.getElementById(Application.CANVAS_ELEMENT_ID) as Nullable<HTMLCanvasElement>;

		if (this.renderingCanvas == null) {
			throw new Exception("Cannot find document canvas element");
		}

		this.renderingCanvas.width = this.getClientWidth();
		this.renderingCanvas.height = this.getClientHeight();
		this.renderingContext = this.renderingCanvas.getContext("webgl2", Application.DEFAULT_CONTEXT_ATTRIBUTES);

		if (this.renderingContext == null) {
			throw new Exception("Cannot get canvas rendering context");
		}
	}

	private onLoadListener(): void {
		this.documentReady = true;
		this.setupRenderingCanvasAndContext();
		this.onInit();
	}

	private onResizeListener(): void {
		const width: number = this.getClientWidth();
		const height: number = this.getClientHeight();

		if (this.renderingCanvas != null) {
			if (this.renderingCanvas.width != width) {
				this.renderingCanvas.width = width;
			}
			if (this.renderingCanvas.height != height) {
				this.renderingCanvas.height = height;
			}
		}

		this.onClientResize(width, height);
	}

	private onErrorListener(event: ErrorEvent): void {
		const e: unknown = event.error;

		this.documentError = true;
		this.ipcErrorChannel.sendError(e);
		this.onError(e);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

}
