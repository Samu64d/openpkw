//
// FPSCounter.ts
//

import TimeProvider from "../../time/TimeProvider.ts";

export default class FPSCounter {

	private static readonly ONE_SECOND: number = 1000;

	private static readonly SMOOTH_AVERAGE_FACTOR: number = 0.9;

	private static smoothAverage(value: number, currentAverage: number, smoothFactor: number): number {
		return value * smoothFactor + currentAverage * (1.0 - smoothFactor);
	}

	private readonly time: TimeProvider;
	private lastTime: number;
	private currentValue: number;
	private lastValue: number;
	private averageValue: number;

	public constructor(time: TimeProvider) {
		this.time = time;
		this.lastTime = this.time.now();
		this.currentValue = 0;
		this.lastValue = 0;
		this.averageValue = 0;
	}

	public update(): void {
		const now: number = this.time.now();

		this.currentValue += 1;

		if (now - this.lastTime >= FPSCounter.ONE_SECOND) {
			this.lastTime = now;

			this.lastValue = this.currentValue;
			this.averageValue = Math.floor(FPSCounter.smoothAverage(this.currentValue, this.averageValue, FPSCounter.SMOOTH_AVERAGE_FACTOR));
			this.currentValue = 0;
		}
	}

	public getLastValue(): number {
		return this.lastValue;
	}

	public getAverageValue(): number {
		return this.averageValue;
	}

	public reset(): void {
		this.lastTime = this.time.now();
		this.currentValue = 0;
		this.lastValue = 0;
		this.averageValue = 0;
	}

}
