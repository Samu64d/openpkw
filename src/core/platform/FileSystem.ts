//
// FileSystem.ts
//

import * as FS from "fs";

export default class FileSystem {

	public static readFile(path: string): Buffer {
		return FS.readFileSync(path, {
			encoding: null
		});
	}

	public static readTextFile(path: string): string {
		return FS.readFileSync(path, {
			encoding: "utf8"
		});
	}

	private constructor() {
	}

}
