//
// BrowserFPSCounter.ts
//

import Disposable from "../core/reflection/decorators/Disposable.ts";
import FPSCounter from "../core/util/logger/FPSCounter.ts";
import BrowserApplication from "./BrowserApplication.ts";

@Disposable()
class BrowserFPSCounter implements Disposable.Target {

	private static readonly ELEMENT_TAG: "p" = "p";

	private static readonly ELEMENT_STYLE: string = "position: absolute; z-index: 1000; top: 0px; left: 0px; margin: 10px; font-size: 18px; font-family: Segoe UI; color: #000000;";

	private readonly application: BrowserApplication;
	private mode: BrowserFPSCounter.MeasurementMode;
	private label: string;
	private readonly counter: FPSCounter;
	private readonly element: HTMLElement;

	public constructor(application: BrowserApplication, measurementMode: BrowserFPSCounter.MeasurementMode, label: string = "FPS") {
		this.application = application;
		this.mode = measurementMode;
		this.label = label;
		this.counter = new FPSCounter(application.getTimeProvider());
		this.element = application.getDocument().createElement(BrowserFPSCounter.ELEMENT_TAG);
		this.element.style = BrowserFPSCounter.ELEMENT_STYLE;
	}

	public getApplication(): BrowserApplication {
		return this.application;
	}

	public getMeasurementMode(): BrowserFPSCounter.MeasurementMode {
		return this.mode;
	}

	public setMeasurementMode(measurementMode: BrowserFPSCounter.MeasurementMode): void {
		this.mode = measurementMode;
	}

	public getLabel(): string {
		return this.label;
	}

	public setLabel(label: string): void {
		this.label = label;
	}

	public getCounter(): FPSCounter {
		return this.counter;
	}

	public appendToBody(): void {
		this.application.getDocument().appendNodeToBody(this.element);
	}

	public update(): void {
		this.counter.update();
		let value: number;

		if (this.mode == BrowserFPSCounter.MeasurementMode.LAST_VALUE) {
			value = this.counter.getLastValue();
		} else {
			value = this.counter.getAverageValue();
		}

		this.element.innerText = this.label + ": " + value.toString();
	}

	public dispose(): void {
		this.application.getDocument().removeNodeFromBody(this.element);
	}

}

namespace BrowserFPSCounter {

	export enum MeasurementMode {
		LAST_VALUE,
		AVERAGE
	}

}

export default BrowserFPSCounter;

