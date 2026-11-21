//
// ArithmeticException.ts
//

import Exception from "./Exception.ts";

export default class ArithmeticException extends Exception {

	public static override readonly NAME: string = "ArithmeticException";

	public constructor(message: string) {
		super(message);

		this.name = ArithmeticException.NAME;
	}

}
