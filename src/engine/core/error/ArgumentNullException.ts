//
// ArgumentNullException.ts
//

import Nullable from "../common/Nullable.ts";
import ArgumentException from "./ArgumentException.ts";

export default class ArgumentNullException extends ArgumentException<unknown> {

	public static throwIfNull<T>(argumentValue: Nullable<T>, parameterName: string): void {
		if (argumentValue == null) {
			throw new ArgumentNullException(parameterName, "Value is null");
		}
	}

	public constructor(parameterName: string, message: Nullable<string> = null) {
		super(parameterName, null, message);
	}

}
