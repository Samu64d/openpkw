//
// CodecException.ts
//

import Exception from "./Exception.ts";

export default class CodecException extends Exception {

	public constructor(message: string) {
		super(message);

		this.name = "CodecException";
	}

}
