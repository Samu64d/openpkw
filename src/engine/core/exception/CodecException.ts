//
// CodecException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class CodecException extends Exception {

	public static override readonly NAME: string = "CodecException";

	public constructor(message: string, maybeError: Nullable<unknown> = null) {
		super(message, maybeError);

		this.name = CodecException.NAME;
	}

}
