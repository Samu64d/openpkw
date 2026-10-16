//
// InvalidOperationException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class InvalidOperationException extends Exception {

	public constructor(message: Nullable<string> = null) {
		super(InvalidOperationException.postponeMessage("Invalid operation", message));
	}

}
