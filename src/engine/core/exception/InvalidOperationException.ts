//
// InvalidOperationException.ts
//

import Exception from "./Exception.ts";

export default class InvalidOperationException extends Exception {

	public constructor(message: string) {
		super(message);
	}

}
