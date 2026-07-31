//
// ElectronIPC.ts
//

import * as Electron from "electron";

import Nullable from "../../core/common/Nullable.ts";
import EventListener from "../../core/common/EventListener.ts";
import ElectronProcess from "./ElectronProcess.ts";

class ElectronIPC {

	public static registerRequestListener(channel: ElectronIPC.Channel, listener: EventListener<ElectronIPC.Channel>): void {
		if (ElectronIPC.register == null) {
			throw new Error("Unsupported operation for this context.");
		}

		ElectronIPC.register(channel, (event: any, ...args: any[]) => {
			return listener(channel, ...args);
		});
	}

	public static sendRequest(channel: ElectronIPC.Channel, ...args: any[]): any {
		if (ElectronIPC.invoker == null) {
			throw new Error("Unsupported operation for this context.");
		}

		return ElectronIPC.invoker(channel, ...args);
	}

	private static register: Nullable<(channel: ElectronIPC.Channel, listener: EventListener<any>) => void> = null;

	private static invoker: Nullable<(channel: ElectronIPC.Channel, ...args: any[]) => any> = null;

	private constructor() {
	}

	static {
		const processType: ElectronProcess.Type = ElectronProcess.getType();

		switch (processType) {
			case ElectronProcess.Type.MAIN:
				ElectronIPC.register = Electron.ipcMain.handle.bind(Electron.ipcMain);
				break;
			case ElectronProcess.Type.RENDERER:
				ElectronIPC.invoker = Electron.ipcRenderer.invoke.bind(Electron.ipcRenderer);
				break;
		}
	}

}

namespace ElectronIPC {

	export type Channel = string;

}

export default ElectronIPC;
