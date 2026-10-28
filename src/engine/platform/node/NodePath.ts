//
// NodePath.ts
//

import * as Path from "node:path";

export default class NodePath {

	public static join(pathList: string[]): string {
		return Path.join(...pathList);
	}

	private constructor() {
	}

}
