//
// Window.ts
//

import * as Electron from "electron";

import Disposable from "../reflection/decorators/Disposable.ts";

@Disposable()
class Window {

	private static readonly DEFAULT_WIDTH: number = 800;
	private static readonly DEFAULT_HEIGHT: number = 600;

	private static readonly OPTIONS_BUILDER: (config: Partial<Window.BuildConfig>) => Electron.BrowserWindowConstructorOptions = (config: Partial<Window.BuildConfig>): Electron.BrowserWindowConstructorOptions => {
		const options: Electron.BrowserWindowConstructorOptions = {
			width: config.width ?? Window.DEFAULT_WIDTH,
			height: config.height ?? Window.DEFAULT_HEIGHT,
			minWidth: config.minWidth ?? 0,
			minHeight: config.minHeight ?? 0,
			maxWidth: config.maxWidth ?? undefined,
			maxHeight: config.maxHeight ?? undefined,
			fullscreen: config.fullscreen ?? false,
			frame: !config.borderless,
			fullscreenable: config.fullscreenable ?? false,
			icon: config.icon
		};
		return options;
	};

	protected readonly window: Electron.BrowserWindow;

	public constructor(config: Partial<Window.BuildConfig>) {
		const options: Electron.BrowserWindowConstructorOptions = Window.OPTIONS_BUILDER(config);
		options.webPreferences = {};
		options.webPreferences.nodeIntegration = true;
		options.webPreferences.webSecurity = false;
		options.webPreferences.contextIsolation = false;
		this.window = new Electron.BrowserWindow(options);
		this.window.removeMenu();
	}

	public getTitle(): string {
		return this.window.getTitle();
	}

	public setTitle(title: string): void {
		this.window.setTitle(title);
	}

	public getWidth(): number {
		return this.window.getSize()[0];
	}

	public setWidth(width: number): void {
		this.window.setSize(width, this.getHeight());
	}

	public getHeight(): number {
		return this.window.getSize()[1];
	}

	public setHeight(height: number): void {
		this.window.setSize(this.getWidth(), height);
	}

	public getMinWidth(): number {
		return this.window.getMinimumSize()[0];
	}

	public setMinWidth(width: number): void {
		this.window.setMinimumSize(width, this.getMinHeight());
	}

	public getMinHeight(): number {
		return this.window.getMinimumSize()[1];
	}

	public setMinHeight(height: number): void {
		this.window.setMinimumSize(this.getMinWidth(), height);
	}

	public getMaxWidth(): number {
		return this.window.getMaximumSize()[0];
	}

	public setMaxWidth(width: number): void {
		this.window.setMaximumSize(width, this.getMaxHeight());
	}

	public getMaxHeight(): number {
		return this.window.getMaximumSize()[1];
	}

	public setMaxHeight(height: number): void {
		this.window.setMaximumSize(this.getMaxWidth(), height);
	}

	public getXPos(): number {
		return this.window.getPosition()[0];
	}

	public setXPos(x: number): void {
		this.window.setPosition(x, this.getYPos());
	}

	public getYPos(): number {
		return this.window.getPosition()[1];
	}

	public setYPos(y: number): void {
		this.window.setPosition(this.getXPos(), y);
	}

	public center(): void {
		this.window.center();
	}

	public getOpacity(): number {
		return this.window.getOpacity();
	}

	public setOpacity(opacity: number): void {
		this.window.setOpacity(opacity);
	}

	public isFullScreenable(): boolean {
		return this.window.isFullScreenable();
	}

	public setFullScreenable(fullScreenable: boolean): void {
		this.window.setFullScreenable(fullScreenable);
	}

	public isMinimizable(): boolean {
		return this.window.isMinimizable();
	}

	public setMinimizable(minimizable: boolean): void {
		this.window.setMinimizable(minimizable);
	}

	public isMaximizable(): boolean {
		return this.window.isMaximizable();
	}

	public setMaximizable(maximizable: boolean): void {
		this.window.setMaximizable(maximizable);
	}

	public setIcon(iconPath: string): void {
		this.window.setIcon(iconPath);
	}

	public minimize(): void {
		this.window.minimize();
	}

	public maximize(): void {
		this.window.maximize();
	}

	public restore(): void {
		this.window.restore();
	}

	public minimizeOrRestore(): boolean {
		if (!this.window.isMinimized()) {
			this.minimize();
			return true;
		} else {
			this.restore();
			return false;
		}
	}

	public maximizeOrRestore(): boolean {
		if (!this.window.isMaximized()) {
			this.maximize();
			return true;
		} else {
			this.restore();
			return false;
		}
	}

	public close(): void {
		this.window.close();
	}

	public makeVisible(): void {
		this.window.show();
		this.window.focus();
	}

	public registerEventHandler(event: any, handler: (...args: any[]) => void): void {
		this.window.on(event, handler);
	}

	public loadWebContents(filePath: string): void {
		this.window.loadFile(filePath);
	}

	public closeWebContents(): void {
		this.window.webContents.close();
	}

	public openDevTools(detach: boolean = false): void {
		if (detach == true) {
			this.window.webContents.openDevTools({
				mode: "detach"
			});
		} else {
			this.window.webContents.openDevTools();
		}
	}

	public closeDevTools(): void {
		this.window.webContents.closeDevTools();
	}

	public dispose(): void {
		if (!this.window.isDestroyed()) {
			this.window.destroy();
		}
	}

}

namespace Window {

	export interface BuildConfig {
		width: number,
		height: number,
		minWidth: number,
		minHeight: number,
		maxWidth: number,
		maxHeight: number,
		fullscreen: boolean,
		borderless: boolean,
		fullscreenable: boolean,
		icon: string
	}

}

export default Window;
