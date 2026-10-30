//
// BrowserWindow.ts
//

import EventListener from "../../core/common/EventListener.ts";
import Supplier from "../../core/common/Supplier.ts";

export default class BrowserWindow {

	public static readonly FROM_GLOBAL_REFERENCE: Supplier<BrowserWindow> = (): BrowserWindow => {
		return new BrowserWindow(window);
	};

	private readonly windowObject: Window;

	private constructor(windowObject: Window) {
		this.windowObject = windowObject;
	}

	public getWindowObject(): Window {
		return this.windowObject;
	}

	public getInnerWidth(): number {
		return this.windowObject.innerWidth;
	}

	public getInnerHeight(): number {
		return this.windowObject.innerHeight;
	}

	public registerEventListener<T extends keyof WindowEventMap>(eventName: T, listener: EventListener<WindowEventMap[T]>): void {
		this.windowObject.addEventListener(eventName, listener);
	}

	public unregisterEventListener<T extends keyof WindowEventMap>(eventName: T, listener: EventListener<WindowEventMap[T]>): void {
		this.windowObject.removeEventListener(eventName, listener);
	}

}
