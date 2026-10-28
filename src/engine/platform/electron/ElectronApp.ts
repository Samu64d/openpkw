//
// ElectronApp.ts
//

import * as Electron from "electron";

import Nullable from "../../core/common/Nullable.ts";
import Supplier from "../../core/common/Supplier.ts";
import EventListener from "../../core/common/EventListener.ts";
import NodeProcess from "../node/NodeProcess.ts";

export default class ElectronApp {

	public static readonly FROM_GLOBAL_REFERENCE: Supplier<ElectronApp> = (): ElectronApp => {
		return new ElectronApp(Electron.app);
	};

	private readonly appObject: Electron.App;

	private constructor(app: Electron.App) {
		this.appObject = app;
	}

	public getAppObject(): Electron.App {
		return this.appObject;
	}

	public getWebCachePath(): string {
		return this.appObject.getPath("userData");
	}

	public setWebCachePath(path: string): void {
		this.appObject.setPath("userData", path);
	}

	public setSwitch(name: string, value: Nullable<string> = null): void {
		if (value != null) {
			this.appObject.commandLine.appendSwitch(name, value);
		} else {
			this.appObject.commandLine.appendSwitch(name);
		}
	}

	public requestSingleInstanceLock(): boolean {
		return this.appObject.requestSingleInstanceLock();
	}

	public disableSecurityWarnings(): void {
		NodeProcess.disableSecurityWarnings();
	}

	public registerEventListener(eventName: any, listener: EventListener<Electron.Event>): void {
		this.appObject.on(eventName, listener);
	}

	public removeEventListener(event: any, listener: EventListener<Electron.Event>): void {
		this.appObject.off(event, listener);
	}

	public exit(): void {
		this.appObject.quit();
	}

}
