//
// ArgumentOutOfRangeException.ts
//

import Nullable from "../common/Nullable.ts";
import ArgumentException from "./ArgumentException.ts";

export default class ArgumentOutOfRangeException<T> extends ArgumentException<T> {

	public static throwIfZero<T>(argumentValue: T, parameterName: string): void {
		if (argumentValue == 0) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be 0");
		}
	}

	public static throwIfEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue == compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be equal to " + compareValue);
		}
	}

	public static throwIfNotEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue != compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value must be equal to " + compareValue);
		}
	}

	public static throwIfGreaterThan<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue > compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be greater than " + compareValue);
		}
	}

	public static throwIfGreaterThanOrEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue >= compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be greater than or equal " + compareValue);
		}
	}

	public static throwIfLessThan<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue < compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be less than " + compareValue);
		}
	}

	public static throwIfLessThanOrEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue <= compareValue) {
			throw new ArgumentOutOfRangeException<T>(parameterName, argumentValue, "Value cannot be less than or equal to " + compareValue);
		}
	}

	public constructor(parameterName: string, argumentValue: Nullable<T> = null, message: Nullable<string> = null) {
		super(parameterName, argumentValue, message);
	}

}
