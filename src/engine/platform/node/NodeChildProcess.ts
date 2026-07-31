//
// NodeChildProcess.ts
//

import * as ChildProcess from "node:child_process";

export default class NodeChildProcess {

	public static spawn(command: string, args: string[], sync: boolean = false): void {
		if (sync == true) {
			ChildProcess.spawnSync(command, args);
		} else {
			ChildProcess.spawn(command, args);
		}
	}

	private constructor() {
	}

}
