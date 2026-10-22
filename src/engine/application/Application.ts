//
// Application.ts
//

import Nullable from "../core/common/Nullable.ts";
import EventListener from "../core/common/EventListener.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";

export default abstract class Application {

	protected readonly document: Document;

	protected constructor() {
		this.document = window.document;
		this.registerWindowEventListeners();
	}

	public abstract onInit(): void;

	public abstract onWindowResize(): void;

	public abstract onError(e: unknown): void;

	protected registerWindowEventListener<T>(eventName: any, listener: EventListener<T>): void {
		window.addEventListener(eventName, listener);
	}

	private updateCanvasSize(): void {
		const body: HTMLElement = this.document.body;
		const canvasElement: Nullable<HTMLCanvasElement> = this.document.getElementById("canvas") as Nullable<HTMLCanvasElement>;

		if (canvasElement == null) {
			return;
		}

		canvasElement.width = Math.floor(body.clientWidth);
		canvasElement.height = Math.floor(body.clientHeight);
	}

	private onLoadListener(): void {
		this.updateCanvasSize();
		this.onInit();
	}

	private onResizeListener(): void {
		this.updateCanvasSize();
		this.onWindowResize();
	}

	private onErrorListener(event: ErrorEvent): void {
		const error: unknown = event.error;

		this.onError(error);
		IPCErrorChannel.sendError(error);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

}
