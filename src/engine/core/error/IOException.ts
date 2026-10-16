//
// IOException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class IOException extends Exception {

	public constructor(message: Nullable<string> = null, maybeError: Nullable<unknown> = null) {
		super(IOException.postponeMessage("IO operation exception", message), maybeError);
	}

}
