//
// ArgumentNullException.ts
//

import Nullable from "../common/Nullable.ts";
import ArgumentException from "./ArgumentException.ts";

export default class ArgumentNullException extends ArgumentException<unknown> {

	public static throwIfNull<T>(argumentValue: Nullable<T>, parameterName: string): void {
		if (argumentValue == null) {
			throw new ArgumentNullException("Value is null", parameterName);
		}
	}

	public constructor(message: string, parameterName: string) {
		super(message, parameterName);
	}

}
