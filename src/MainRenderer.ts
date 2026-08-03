// 
// MainRenderer.ts
//

import Nullable from "./engine/core/common/Nullable.ts";
import EventListener from "./engine/core/common/EventListener.ts";
import ElectronProcess from "./engine/platform/electron/ElectronProcess.ts";
import ElectronIPC from "./engine/platform/electron/ElectronIPC.ts";
import Main from "./Main.ts";
import MainTest from "./test/MainTest.ts";

export default class MainRenderer {

	public static getInstance(): MainRenderer {
		if (MainRenderer.instance == null) {
			throw new Error("Accessing uninitialized class instance.");
		}

		return MainRenderer.instance;
	}

	private static instance: Nullable<MainRenderer> = null;

	private readonly document: Document;

	private constructor() {
		this.document = window.document;
		this.registerWindowEventListeners();
	}

	private registerWindowEventListener<T>(eventName: any, listener: EventListener<T>): void {
		window.addEventListener(eventName, listener);
	}

	private updateCanvasSize(): void {
		const canvasElement: Nullable<HTMLCanvasElement> = this.document.getElementById("canvas") as Nullable<HTMLCanvasElement>;
		if (canvasElement != null) {
			canvasElement.width = Math.floor(this.document.body.clientWidth);
			canvasElement.height = Math.floor(this.document.body.clientHeight);
		}
	}

	private onLoadListener(): void {
		this.updateCanvasSize();
		MainTest.instance.initRenderer();
		MainTest.instance.initOther();
	}

	private onResizeListener(): void {
		this.updateCanvasSize();
		MainTest.instance.forceUpdateRenderer();
	}

	private onErrorListener(event: ErrorEvent): void {
		const message = event.message;
		void ElectronIPC.sendRequest(Main.IPC_ERROR_CHANNEL, message);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

	static {
		if (ElectronProcess.getType() == ElectronProcess.Type.RENDERER) {
			MainRenderer.instance = new MainRenderer();
		}
	}

}
