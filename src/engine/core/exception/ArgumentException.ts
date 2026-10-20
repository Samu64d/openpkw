//
// ArgumentException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class ArgumentException<T> extends Exception {

	private static buildArgumentMessage<T>(parameterName: string, argumentValue: Nullable<T> = null): string {
		let message: string = "Exception with argument value";

		if (argumentValue != null) {
			message += " (" + argumentValue + ")";
		}

		return message + " of the parameter '" + parameterName + "'";
	}

	protected readonly parameterName: string;
	protected readonly argumentValue: Nullable<T>;

	public constructor(message: string, parameterName: string, argumentValue: Nullable<T> = null) {
		super(ArgumentException.postponeMessage(ArgumentException.buildArgumentMessage(parameterName, argumentValue), message));

		this.name = "ArgumentException";
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
