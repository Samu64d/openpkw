//
// ElectronWindow.ts
//

import * as Electron from "electron";

import EventListener from "../../core/common/EventListener.ts";
import Disposable from "../../core/reflection/decorators/Disposable.ts";
import ElectronWebContentsView from "./ElectronWebContentsView.ts";

@Disposable()
class ElectronWindow implements Disposable.Target {

	private static readonly DEFAULT_WIDTH: number = 800;

	private static readonly DEFAULT_HEIGHT: number = 600;

	private static buildConstructorOptions(config: Partial<ElectronWindow.BuildConfig>): Electron.BaseWindowConstructorOptions {
		const options: Electron.BrowserWindowConstructorOptions = {
			width: config.width ?? ElectronWindow.DEFAULT_WIDTH,
			height: config.height ?? ElectronWindow.DEFAULT_HEIGHT,
			minWidth: config.minWidth ?? 0,
			minHeight: config.minHeight ?? 0,
			maxWidth: config.maxWidth ?? undefined,
			maxHeight: config.maxHeight ?? undefined,
			fullscreen: config.fullscreen ?? false,
			frame: !config.borderless,
			fullscreenable: config.fullscreenable ?? false,
			title: config.title ?? "Application",
			icon: config.icon
		};

		return options;
	};

	private readonly windowObject: Electron.BaseWindow;

	public constructor(config: Partial<ElectronWindow.BuildConfig>) {
		const options: Electron.BrowserWindowConstructorOptions = ElectronWindow.buildConstructorOptions(config);

		this.windowObject = new Electron.BrowserWindow(options);
		this.windowObject.removeMenu();
	}

	public getTitle(): string {
		return this.windowObject.getTitle();
	}

	public setTitle(title: string): void {
		this.windowObject.setTitle(title);
	}

	public getWidth(): number {
		return this.windowObject.getSize()[0];
	}

	public setWidth(width: number): void {
		this.windowObject.setSize(width, this.getHeight());
	}

	public getHeight(): number {
		return this.windowObject.getSize()[1];
	}

	public setHeight(height: number): void {
		this.windowObject.setSize(this.getWidth(), height);
	}

	public getMinWidth(): number {
		return this.windowObject.getMinimumSize()[0];
	}

	public setMinWidth(minWidth: number): void {
		this.windowObject.setMinimumSize(minWidth, this.getMinHeight());
	}

	public getMinHeight(): number {
		return this.windowObject.getMinimumSize()[1];
	}

	public setMinHeight(minHeight: number): void {
		this.windowObject.setMinimumSize(this.getMinWidth(), minHeight);
	}

	public getMaxWidth(): number {
		return this.windowObject.getMaximumSize()[0];
	}

	public setMaxWidth(maxWidth: number): void {
		this.windowObject.setMaximumSize(maxWidth, this.getMaxHeight());
	}

	public getMaxHeight(): number {
		return this.windowObject.getMaximumSize()[1];
	}

	public setMaxHeight(maxHeight: number): void {
		this.windowObject.setMaximumSize(this.getMaxWidth(), maxHeight);
	}

	public getXPos(): number {
		return this.windowObject.getPosition()[0];
	}

	public setXPos(xPos: number): void {
		this.windowObject.setPosition(xPos, this.getYPos());
	}

	public getYPos(): number {
		return this.windowObject.getPosition()[1];
	}

	public setYPos(yPos: number): void {
		this.windowObject.setPosition(this.getXPos(), yPos);
	}

	public center(): void {
		this.windowObject.center();
	}

	public getOpacity(): number {
		return this.windowObject.getOpacity();
	}

	public setOpacity(opacity: number): void {
		this.windowObject.setOpacity(opacity);
	}

	public isFullScreenable(): boolean {
		return this.windowObject.isFullScreenable();
	}

	public setFullScreenable(fullScreenable: boolean): void {
		this.windowObject.setFullScreenable(fullScreenable);
	}

	public isMinimizable(): boolean {
		return this.windowObject.isMinimizable();
	}

	public setMinimizable(minimizable: boolean): void {
		this.windowObject.setMinimizable(minimizable);
	}

	public isMaximizable(): boolean {
		return this.windowObject.isMaximizable();
	}

	public setMaximizable(maximizable: boolean): void {
		this.windowObject.setMaximizable(maximizable);
	}

	public setIcon(iconPath: string): void {
		this.windowObject.setIcon(iconPath);
	}

	public minimize(): void {
		this.windowObject.minimize();
	}

	public maximize(): void {
		this.windowObject.maximize();
	}

	public restore(): void {
		this.windowObject.restore();
	}

	public minimizeOrRestore(): boolean {
		if (this.windowObject.isMinimized() == false) {
			this.minimize();
			return true;
		}

		this.restore();
		return false;
	}

	public maximizeOrRestore(): boolean {
		if (this.windowObject.isMaximized() == false) {
			this.maximize();
			return true;
		}

		this.restore();
		return false;
	}

	public close(): void {
		this.windowObject.close();
	}

	public makeVisible(): void {
		this.windowObject.show();
		this.windowObject.focus();
	}

	public addWebContentView(webContentView: ElectronWebContentsView): void {
		this.windowObject.contentView.addChildView(webContentView.getWebContentsViewObject());
	}

	public removeWebContentView(webContentView: ElectronWebContentsView): void {
		this.windowObject.contentView.removeChildView(webContentView.getWebContentsViewObject());
	}

	public registerEventListener(event: any, listener: EventListener<Electron.Event>): void {
		this.windowObject.on(event, listener);
	}

	public removeEventListener(event: any, listener: EventListener<Electron.Event>): void {
		this.windowObject.off(event, listener);
	}

	public dispose(): void {
		if (this.windowObject.isDestroyed() == true) {
			return;
		}

		this.windowObject.destroy();
	}

}

namespace ElectronWindow {

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
		title: string,
		icon: string
	}

}

export default ElectronWindow;
