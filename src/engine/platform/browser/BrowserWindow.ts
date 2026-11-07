//
// BrowserWindow.ts
//

import Supplier from "../../core/common/Supplier.ts";
import EventListener from "../../core/event/EventListener.ts";
import EventEmitter from "../../core/event/EventEmitter.ts";

export default class BrowserWindow implements EventEmitter<keyof WindowEventMap, WindowEventMap[keyof WindowEventMap]> {

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

	public requestAnimationFrame(callback: FrameRequestCallback): number {
		return this.windowObject.requestAnimationFrame(callback);
	}

	public cancelAnimationFrame(handle: number): void {
		this.windowObject.cancelAnimationFrame(handle);
	}

	public registerEventListener<T extends keyof WindowEventMap>(eventName: T, listener: EventListener<WindowEventMap[T]>): void {
		this.windowObject.addEventListener(eventName, listener);
	}

	public unregisterEventListener<T extends keyof WindowEventMap>(eventName: T, listener: EventListener<WindowEventMap[T]>): void {
		this.windowObject.removeEventListener(eventName, listener);
	}

}
