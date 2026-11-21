//
// NotImplementedException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class NotImplementedException extends Exception {

	public static override readonly NAME: string = "NotImplementedException";

	public constructor(message: string, maybeError: Nullable<unknown> = null) {
		super(message, maybeError);

		this.name = NotImplementedException.NAME;
	}

}
