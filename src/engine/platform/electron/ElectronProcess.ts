//
// ElectronProcess.ts
//

import * as Process from "process";

class ElectronProcess {

	public static getType(): ElectronProcess.Type {
		return Process.type as ElectronProcess.Type;
	}

	public static getEnvironmentVar(varName: string): string | undefined {
		return Process.env[varName];
	}

	public static setEnvironmentVar(varName: string, value: string | undefined): void {
		Process.env[varName] = value;
	}

	public static getEnvironmentVarList(): Record<string, string | undefined> {
		return Process.env;
	}

	public static disableSecurityWarnings(): void {
		ElectronProcess.setEnvironmentVar("ELECTRON_DISABLE_SECURITY_WARNINGS", "true");
	}

	private constructor() {
	}

}

namespace ElectronProcess {

	export const enum Type {
		MAIN = "browser",
		RENDERER = "renderer",
		SERVICE_WORKER = "service-worker",
		WORKER = "worker",
		UTILITY = "utility"
	}

}

export default ElectronProcess;
