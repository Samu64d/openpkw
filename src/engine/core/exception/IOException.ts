//
// IOException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class IOException extends Exception {

	public constructor(message: string, maybeError: Nullable<unknown> = null) {
		super(message, maybeError);
	}

}
