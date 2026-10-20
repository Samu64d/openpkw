//
// ArithmeticException.ts
//

import Exception from "./Exception.ts";

export default class ArithmeticException extends Exception {

	public constructor(message: string) {
		super(message);
	}

}
