//
// ArgumentException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class ArgumentException<T> extends Exception {

	private static buildMessage<T>(parameterName: string, argumentValue: Nullable<T> = null): string {
		let message: string = "Invalid argument value";

		if (argumentValue != null) {
			message += " (" + argumentValue + ")";
		}

		return message + " for parameter '" + parameterName + "'";
	}

	protected readonly parameterName: string;
	protected readonly argumentValue: Nullable<T>;

	public constructor(parameterName: string, argumentValue: Nullable<T> = null, message: Nullable<string> = null) {
		super(ArgumentException.postponeMessage(ArgumentException.buildMessage(parameterName, argumentValue), message));

		this.parameterName = parameterName;
		this.argumentValue = argumentValue;
	}

	public getParameterName(): string {
		return this.parameterName;
	}

	public getArgumentValue(): Nullable<T> {
		return this.argumentValue;
	}

}
