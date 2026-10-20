//
// ArgumentOutOfRangeException.ts
//

import Nullable from "../common/Nullable.ts";
import ArgumentException from "./ArgumentException.ts";

export default class ArgumentOutOfRangeException<T> extends ArgumentException<T> {

	public static throwIfZero<T>(argumentValue: T, parameterName: string): void {
		if (argumentValue == 0) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be 0", parameterName, argumentValue);
		}
	}

	public static throwIfEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue == compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be equal to " + compareValue, parameterName, argumentValue);
		}
	}

	public static throwIfNotEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue != compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value must be equal to " + compareValue, parameterName, argumentValue);
		}
	}

	public static throwIfGreaterThan<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue > compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be greater than " + compareValue, parameterName, argumentValue);
		}
	}

	public static throwIfGreaterThanOrEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue >= compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be greater than or equal " + compareValue, parameterName, argumentValue);
		}
	}

	public static throwIfLessThan<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue < compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be less than " + compareValue, parameterName, argumentValue);
		}
	}

	public static throwIfLessThanOrEqual<T>(argumentValue: T, compareValue: T, parameterName: string): void {
		if (argumentValue <= compareValue) {
			throw new ArgumentOutOfRangeException<T>("Value cannot be less than or equal to " + compareValue, parameterName, argumentValue);
		}
	}

	public constructor(message: string, parameterName: string, argumentValue: Nullable<T> = null) {
		super(message, parameterName, argumentValue);

		this.name = "ArgumentOutOfRangeException";
	}

}
