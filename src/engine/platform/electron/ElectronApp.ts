//
// ElectronApp.ts
//

import * as Electron from "electron";

import Nullable from "../../core/common/Nullable.ts";
import EventListener from "../../core/common/EventListener.ts";

export default class ElectronApp {

	public static getInstance(): Electron.App {
		return ElectronApp.app;
	}

	public static getWebCachePath(): string {
		return this.app.getPath("userData");
	}

	public static setWebCachePath(path: string): void {
		this.app.setPath("userData", path);
	}

	public static registerEventListener(eventName: any, listener: EventListener<Electron.Event>): void {
		this.app.on(eventName, listener);
	}

	public static setSwitch(name: string, value: Nullable<string> = null): void {
		if (value != null) {
			this.app.commandLine.appendSwitch(name, value);
		} else {
			this.app.commandLine.appendSwitch(name);
		}
	}

	public static requestSingleInstanceLock(): boolean {
		return this.app.requestSingleInstanceLock();
	}

	public static exit(): void {
		this.app.quit();
	}

	private static readonly app: Electron.App = Electron.app;

	private constructor() { }

}
