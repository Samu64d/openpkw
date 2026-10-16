//
// ArithmeticException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class ArithmeticException extends Exception {

	public constructor(message: Nullable<string> = null) {
		super(ArithmeticException.postponeMessage("Invalid arithmetic operation", message));
	}

}
