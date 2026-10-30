//
// Application.ts
//

import BrowserWindow from "../platform/browser/BrowserWindow.ts";
import BrowserDocument from "../platform/browser/BrowserDocument.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";
import Application from "./Application.ts";

export default abstract class BrowserApplication extends Application {

	public static override getContentsTemplate(): string {
		return `
			<!DOCTYPE html>
			<html style="box-sizing: content-box; width: 100%; height: 100%; margin: 0px; user-select: none; cursor: default;">
				<head>
					<meta charset="UTF-8"></meta>
					<script src="{{entryPointPath}}"></script>
				</head>
				<body style="box-sizing: content-box; display: flex; width: 100%; height: 100%; margin: 0px; justify-content: center; align-items: center;">
				</body>
			</html>
		`;
	}

	protected readonly ipcErrorChannel: IPCErrorChannel;
	protected readonly browserWindow: BrowserWindow;
	protected readonly browserDocument: BrowserDocument;
	private windowIsReady: boolean;
	private windowHasErrors: boolean;

	protected constructor() {
		super();

		this.ipcErrorChannel = new IPCErrorChannel(ElectronIPC.FROM_GLOBAL_REFERENCE());
		this.browserWindow = BrowserWindow.FROM_GLOBAL_REFERENCE();
		this.browserDocument = BrowserDocument.FROM_GLOBAL_REFERENCE();
		this.windowIsReady = false;
		this.windowHasErrors = false;
		this.registerWindowEventListeners();
	}

	public override isReady(): boolean {
		return this.windowIsReady;
	}

	public override getClientWidth(): number {
		return Math.floor(this.browserWindow.getInnerWidth());
	}

	public override getClientHeight(): number {
		return Math.floor(this.browserWindow.getInnerHeight());
	}

	public override hasErrors(): boolean {
		return this.windowHasErrors;
	}

	public getDocument(): BrowserDocument {
		return this.browserDocument;
	}

	protected onLoadListener(): void {
		this.windowIsReady = true;
		this.onReady();
	}

	protected onResizeListener(): void {
		const width: number = this.getClientWidth();
		const height: number = this.getClientHeight();

		this.onClientResize(width, height);
	}

	protected onErrorListener(event: ErrorEvent): void {
		this.windowHasErrors = true;
		this.ipcErrorChannel.sendError(event.error);
		this.onError(event.error);
	}

	private registerWindowEventListeners(): void {
		this.browserWindow.registerEventListener("load", this.onLoadListener.bind(this));
		this.browserWindow.registerEventListener("resize", this.onResizeListener.bind(this));
		this.browserWindow.registerEventListener("error", this.onErrorListener.bind(this));
	}

}
