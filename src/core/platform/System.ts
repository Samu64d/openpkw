//
// System.ts
//

import * as OS from "os";
import * as ChildProcess from "child_process";

export default class System {

	public static getHomeDir(): string {
		return OS.homedir();
	}

	public static spawnProcess(command: string, args: string[], sync: boolean = false): void {
		if (sync == true) {
			ChildProcess.spawnSync(command, args);
		} else {
			ChildProcess.spawn(command, args);
		}
	}

	private constructor() {
	}

}
