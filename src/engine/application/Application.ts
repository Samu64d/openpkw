//
// Application.ts
//

import EventListener from "../core/common/EventListener.ts";
import NodePath from "../platform/node/NodePath.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import ApplicationContents from "./ApplicationContents.ts";
import IPCErrorChannel from "./IPCErrorChannel.ts";

export default abstract class Application {

	public static readonly CONTENTS_TEMPLATE: string = `
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

	public static generateApplicationContents(entryPointPath: string): ApplicationContents {
		const template: string = Application.CONTENTS_TEMPLATE;
		const templateInstance: string = template.replace("{{entryPointPath}}", entryPointPath);
		const dataUrl: string = "data:text/html;base64," + Buffer.from(templateInstance).toString("base64");
		const baseUrl: string = NodePath.join([__dirname, "../"]);

		return new ApplicationContents(entryPointPath, dataUrl, baseUrl);
	}

	protected readonly ipcErrorChannel: IPCErrorChannel;
	protected readonly window: Window;
	private windowIsReady: boolean;
	private windowHasErrors: boolean;

	protected constructor() {
		this.ipcErrorChannel = new IPCErrorChannel(ElectronIPC.FROM_GLOBAL_REFERENCE());
		this.window = window;
		this.windowIsReady = false;
		this.windowHasErrors = false;
		this.registerWindowEventListeners();
	}

	public isReady(): boolean {
		return this.windowIsReady;
	}

	public abstract onReady(): void;

	public getClientWidth(): number {
		return Math.floor(this.window.innerWidth);
	}

	public getClientHeight(): number {
		return Math.floor(this.window.innerHeight);
	}

	public abstract onClientResize(width: number, height: number): void;

	public hasErrors(): boolean {
		return this.windowHasErrors;
	}

	public abstract onError(e: unknown): void;

	protected getDocument(): Document {
		return this.window.document;
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

	private registerWindowEventListener<T extends keyof WindowEventMap>(eventName: T, listener: EventListener<WindowEventMap[T]>): void {
		this.window.addEventListener(eventName, listener);
	}

	private registerWindowEventListeners(): void {
		this.registerWindowEventListener("load", this.onLoadListener.bind(this));
		this.registerWindowEventListener("resize", this.onResizeListener.bind(this));
		this.registerWindowEventListener("error", this.onErrorListener.bind(this));
	}

}
