// 
// MainRenderer.ts
//

import Nullable from "./core/foundation/Nullable.ts";
import Process from "./core/platform/Process.ts";
import MainTest from "./test/MainTest.ts";
import Main from "./Main.ts";

export default class MainRenderer {

	public static getInstance(): MainRenderer {
		if (MainRenderer.instance == null) {
			throw new Error("Accessing uninitialized class instance.");
		}

		return MainRenderer.instance;
	}

	private static instance: Nullable<MainRenderer> = null;

	private static main(): void {
		MainRenderer.instance = new MainRenderer();
	}

	private document: Document;

	private constructor() {
		this.document = window.document;
		this.registerWindowEventListeners();
	}

	private registerWindowEventListener(eventName: any, listener: (...args: any) => void): void {
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
		MainTest.instance.initRenderer();
		MainTest.instance.initOther();
	}

	private onResizeListener(): void {
		this.updateCanvasSize();
		MainTest.instance.forceUpdateRenderer();
	}

	private onErrorListener(event: ErrorEvent): void {
		const message = event.message;
		void Process.Communication.sendRequest(Main.IPC_ERROR_CHANNEL, message);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

	static {
		if (Process.getType() == Process.Type.RENDERER) {
			MainRenderer.main();
		}
	}

}
