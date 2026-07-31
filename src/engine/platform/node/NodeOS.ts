//
// NodeOS.ts
//

import * as OS from "node:os";

export default class NodeOS {

	public static getHomeDir(): string {
		return OS.homedir();
	}

	private constructor() { }

}
