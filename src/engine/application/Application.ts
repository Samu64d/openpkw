//
// Application.ts
//

import Nullable from "../core/common/Nullable.ts";
import EventListener from "../core/common/EventListener.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import ApplicationBootstrapper from "./ApplicationBootstrapper.ts";

export default abstract class Application {

	protected readonly document: Document;

	protected constructor() {
		this.document = window.document;
		this.registerWindowEventListeners();
	}

	public abstract onInit(): void;

	public abstract onWindowResize(): void;

	public abstract onError(): void;

	private registerWindowEventListener<T>(eventName: any, listener: EventListener<T>): void {
		window.addEventListener(eventName, listener);
	}

	private updateCanvasSize(): void {
		const canvasElement: Nullable<HTMLCanvasElement> = this.document.getElementById("canvas") as Nullable<HTMLCanvasElement>;

		if (canvasElement == null) {
			return;
		}

		canvasElement.width = Math.floor(this.document.body.clientWidth);
		canvasElement.height = Math.floor(this.document.body.clientHeight);
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
		const message: string = event.message;

		this.onError();
		void ElectronIPC.sendRequest(ApplicationBootstrapper.IPC_ERROR_CHANNEL, message);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

}
