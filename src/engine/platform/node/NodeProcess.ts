//
// NodeProcess.ts
//

import EventListener from "../../core/common/EventListener.ts";

class NodeProcess {

	public static getType(): NodeProcess.Type {
		return process.type as NodeProcess.Type;
	}

	public static getEnvironmentVar(varName: string): string | undefined {
		return process.env[varName];
	}

	public static setEnvironmentVar(varName: string, value: string | undefined): void {
		process.env[varName] = value;
	}

	public static getEnvironmentVarList(): Record<string, string | undefined> {
		return process.env;
	}

	public static disableSecurityWarnings(): void {
		NodeProcess.setEnvironmentVar("ELECTRON_DISABLE_SECURITY_WARNINGS", "true");
	}

	public static registerEventListener(eventName: any, listener: EventListener<Electron.Event>): void {
		process.on(eventName, listener);
	}

	public static removeEventListener(event: any, listener: EventListener<Electron.Event>): void {
		process.off(event, listener);
	}

	private constructor() {
	}

}

namespace NodeProcess {

	export const enum Type {
		MAIN = "browser",
		RENDERER = "renderer",
		SERVICE_WORKER = "service-worker",
		WORKER = "worker",
		UTILITY = "utility"
	}

}

export default NodeProcess;
