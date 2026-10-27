//
// ElectronWebContentsView.ts
//

import * as Electron from "electron";

import Nullable from "../../core/common/Nullable.ts";
import EventListener from "../../core/common/EventListener.ts";
import Disposable from "../../core/reflection/decorators/Disposable.ts";
import ElectronWindow from "./ElectronWindow.ts";

@Disposable()
export default class ElectronWebContentsView implements Disposable.Target {

	private static readonly DEFAULT_WEB_PREFERENCES: Electron.WebPreferences = {
		nodeIntegration: true,
		webSecurity: false,
		contextIsolation: false
	};

	private static buildConstructorOptions(): Electron.WebContentsViewConstructorOptions {
		const options: Electron.WebContentsViewConstructorOptions = {
			webPreferences: ElectronWebContentsView.DEFAULT_WEB_PREFERENCES
		};

		return options;
	};

	private readonly webContentsViewObject: Electron.WebContentsView;
	private adaptWindow: Nullable<ElectronWindow>;
	private adaptWindowCallback: Nullable<EventListener<Electron.Event>>;

	public constructor() {
		const options: Electron.WebContentsViewConstructorOptions = ElectronWebContentsView.buildConstructorOptions();

		this.webContentsViewObject = new Electron.WebContentsView(options);
		this.adaptWindow = null;
		this.adaptWindowCallback = null;
	}

	public getWebContentsViewObject(): Electron.WebContentsView {
		return this.webContentsViewObject;
	}

	public getWidth(): number {
		return this.getBounds().width;
	}

	public setWidth(width: number): void {
		const bounds: Electron.Rectangle = this.getBounds();

		bounds.width = width;
		this.setBounds(bounds);
	}

	public getHeight(): number {
		return this.getBounds().height;
	}

	public setHeight(height: number): void {
		const bounds: Electron.Rectangle = this.getBounds();

		bounds.height = height;
		this.setBounds(bounds);
	}

	public getXPos(): number {
		return this.getBounds().x;
	}

	public setXPos(xPos: number): void {
		const bounds: Electron.Rectangle = this.getBounds();

		bounds.x = xPos;
		this.setBounds(bounds);
	}

	public getYPos(): number {
		return this.getBounds().y;
	}

	public setYPos(yPos: number): void {
		const bounds: Electron.Rectangle = this.getBounds();

		bounds.y = yPos;
		this.setBounds(bounds);
	}

	public loadURL(url: string): void {
		this.getWebContents().loadURL(url);
	}

	public loadFile(filePath: string): void {
		this.getWebContents().loadFile(filePath);
	}

	public unload(): void {
		this.loadURL("about:blank");
	}

	public openDevTools(detach: boolean = false): void {
		if (detach == true) {
			this.getWebContents().openDevTools({
				mode: "detach"
			});
		} else {
			this.getWebContents().openDevTools();
		}
	}

	public closeDevTools(): void {
		this.getWebContents().closeDevTools();
	}

	public autoAdaptToWindowBounds(window: ElectronWindow): void {
		if (this.adaptWindow == window) {
			return;
		}

		if (this.adaptWindow != null) {
			this.removeAutoAdaptToWindowBounds();
		}

		this.adaptWindow = window;
		this.adaptWindowResizeListener();
		this.adaptWindowCallback = this.adaptWindowResizeListener.bind(this);
		this.adaptWindow.registerEventListener("resize", this.adaptWindowCallback);
	}

	public removeAutoAdaptToWindowBounds(): void {
		if (this.adaptWindow == null || Disposable.isDisposed(this.adaptWindow)) {
			return;
		}

		if (this.adaptWindowCallback != null) {
			this.adaptWindow.removeEventListener("resize", this.adaptWindowCallback);
		}

		this.adaptWindow = null;
	}

	public dispose(): void {
		if (this.getWebContents().isDestroyed() == true) {
			return;
		}

		this.getWebContents().close();
	}

	private getBounds(): Electron.Rectangle {
		return this.webContentsViewObject.getBounds();
	}

	private setBounds(bounds: Electron.Rectangle): void {
		this.webContentsViewObject.setBounds(bounds);
	}

	private getWebContents(): Electron.WebContents {
		return this.webContentsViewObject.webContents;
	}

	private adaptWindowResizeListener(): void {
		if (this.adaptWindow == null || Disposable.isDisposed(this.adaptWindow)) {
			return;
		}

		const width: number = this.adaptWindow.getWidth();
		const height: number = this.adaptWindow.getHeight();

		this.setXPos(0);
		this.setYPos(0);
		this.setWidth(width);
		this.setHeight(height);
	}

}
