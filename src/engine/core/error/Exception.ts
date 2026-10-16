//
// Exception.ts
//

import Nullable from "../common/Nullable.ts";

export default class Exception extends Error {

	protected static postponeMessage(message: string, postponeMessage: Nullable<string> = null): string {
		if (postponeMessage != null) {
			message += ": " + postponeMessage;
		}

		return message;
	}

	private static buildFullMessage(message: string, maybeError: Nullable<unknown> = null): string {
		if (maybeError instanceof Error) {
			message += ". Caused by: " + maybeError.message + ")";
		}

		return message + ".";
	}

	public constructor(message: string, maybeError: Nullable<unknown> = null) {
		super(Exception.buildFullMessage(message, maybeError));
	}

}
