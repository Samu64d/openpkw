//
// InvalidRangeException.ts
//

import Nullable from "../common/Nullable.ts";
import Exception from "./Exception.ts";

export default class InvalidRangeException<T extends number> extends Exception {

	public static throwIfBoundsInvalid<T extends number>(minValue: T, maxValue: T, minValueName: string, maxValueName: string): void {
		if (minValue > maxValue) {
			throw new InvalidRangeException<T>("Values are not valid bounds values", minValueName, maxValueName, minValue, maxValue);
		}
	}

	public static throwIfBoundsInvalidOrNegative<T extends number>(minValue: T, maxValue: T, minValueName: string, maxValueName: string): void {
		if (minValue > maxValue) {
			throw new InvalidRangeException<T>("Values are not valid bounds values", minValueName, maxValueName, minValue, maxValue);
		}
		if (minValue <= 0 || maxValue <= 0) {
			throw new InvalidRangeException<T>("Values cannot be negative", minValueName, maxValueName, minValue, maxValue);
		}
	}

	private static buildRangeMessage<T extends number>(minValueName: string, maxValueName: string, minValue: Nullable<T> = null, maxValue: Nullable<T> = null): string {
		let message: string = "Invalid values ";

		if (minValue != null && maxValue != null) {
			message += " (" + minValue + ", " + maxValue + ")";
		}

		return message + " for range ('" + minValueName + "', '" + maxValueName + "')";
	}

	protected readonly minValueName: string;
	protected readonly maxValueName: string;
	protected readonly minValue: Nullable<T>;
	protected readonly maxValue: Nullable<T>;

	public constructor(message: string, minValueName: string, maxValueName: string, minValue: Nullable<T> = null, maxValue: Nullable<T> = null) {
		super(InvalidRangeException.postponeMessage(InvalidRangeException.buildRangeMessage(minValueName, maxValueName, minValue, maxValue), message));

		this.minValueName = minValueName;
		this.maxValueName = maxValueName;
		this.minValue = minValue;
		this.maxValue = maxValue;
	}

	public getMinValueName(): string {
		return this.minValueName;
	}

	public getMaxValueName(): string {
		return this.maxValueName;
	}

	public getMinValue(): Nullable<T> {
		return this.minValue;
	}

	public getMaxValue(): Nullable<T> {
		return this.maxValue;
	}

}
