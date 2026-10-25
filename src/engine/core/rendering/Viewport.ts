//
// Viewport.ts
//

import ArgumentOutOfRangeException from "../exception/ArgumentOutOfRangeException.ts";

export default class Viewport {

	private width: number;
	private height: number;
	private aspectRatio: number;

	public constructor(width: number, height: number) {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(width, 0, "width");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(height, 0, "height");

		this.width = width;
		this.height = height;
		this.aspectRatio = this.width / this.height;
	}

	public getWidth(): number {
		return this.width;
	}

	public setWidth(width: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(width, 0, "width");

		this.width = width;
		this.updateAspectRatio();
	}

	public getHeight(): number {
		return this.height;
	}

	public setHeight(height: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(height, 0, "height");

		this.height = height;
		this.updateAspectRatio();
	}

	public getSize(): number[] {
		return [this.width, this.height];
	}

	public setSize(width: number, height: number): void {
		this.setWidth(width);
		this.setHeight(height);
	}

	public getAspectRatio(): number {
		return this.aspectRatio;
	}

	private updateAspectRatio(): void {
		this.aspectRatio = this.width / this.height;
	}

}
