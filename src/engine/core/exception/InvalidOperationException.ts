//
// InvalidOperationException.ts
//

import Exception from "./Exception.ts";

export default class InvalidOperationException extends Exception {

	public static override readonly NAME: string = "InvalidOperationException";

	public constructor(message: string) {
		super(message);

		this.name = InvalidOperationException.NAME;
	}

}
