//
// Process.ts
//

import * as Process_ from "process";
import * as Electron from "electron";

import Nullable from "../foundation/Nullable.ts";

class Process {

	public static getType(): Process.Type {
		return Process_.type as Process.Type;
	}

	public static getEnvironmentVars(): Record<string, string | undefined> {
		return Process_.env;
	}

	public static setEnvironmentVar(varName: string, value: string | undefined): void {
		Process_.env[varName] = value;
	}

	private constructor() {
	}

}

namespace Process {

	export const enum Type {
		MAIN = "browser",
		RENDERER = "renderer",
		SERVICE_WORKER = "service-worker",
		WORKER = "worker",
		UTILITY = "utility"
	}

	export class Communication {

		public static registerRequestListener(channel: string, listener: (...args: any) => any): void {
			if (Communication.listener == null) {
				throw new Error("Unsupported operation for this context.");
			}

			Communication.listener(channel, (event: any, ...args: any[]) => {
				return listener(...args);
			});
		}

		public static sendRequest(channel: string, ...args: any[]): any {
			if (Communication.handler == null) {
				throw new Error("Unsupported operation for this context.");
			}

			return Communication.handler(channel, ...args);
		}

		private static handler: Nullable<(channel: string, ...args: any[]) => any> = null;

		private static listener: Nullable<(channel: string, listener: (event: any, ...args: any[]) => any) => void> = null;

		private constructor() {
		}

		static {
			const processType: Process.Type = Process.getType();
			if (processType == Type.MAIN) {
				Communication.listener = Electron.ipcMain.handle.bind(Electron.ipcMain);
			} else if (processType == Type.RENDERER) {
				Communication.handler = Electron.ipcRenderer.invoke.bind(Electron.ipcRenderer);
			}
		}

	}

}

export default Process;
