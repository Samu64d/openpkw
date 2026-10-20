//
// Projection.ts
//

import ArgumentOutOfRangeException from "../exception/ArgumentOutOfRangeException.ts";

export default class Projection {

	private aspectRatio: number;
	private fieldOfView: number;
	private nearDistance: number;
	private farDistance: number;
	private readonly matrix: number[];
	private updated: boolean;

	public constructor(aspectRatio: number, fieldOfView: number, nearDistance: number, farDistance: number) {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(aspectRatio, 0, "aspectRatio");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(fieldOfView, 0, "fieldOfView");
		ArgumentOutOfRangeException.throwIfGreaterThanOrEqual(fieldOfView, Math.PI, "fieldOfView");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(nearDistance, 0, "nearDistance");
		ArgumentOutOfRangeException.throwIfGreaterThanOrEqual(nearDistance, farDistance, "nearDistance");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(farDistance, 0, "farDistance");

		this.aspectRatio = aspectRatio;
		this.fieldOfView = fieldOfView;
		this.nearDistance = nearDistance;
		this.farDistance = farDistance;
		this.matrix = new Array<number>(16);
		this.updated = false;
		this.updateMatrix();
	}

	public getAspectRatio(): number {
		return this.aspectRatio;
	}

	public setAspectRatio(aspectRatio: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(aspectRatio, 0, "aspectRatio");

		this.aspectRatio = aspectRatio;
		this.invalidate();
	}

	public getFieldOfView(): number {
		return this.fieldOfView;
	}

	public setFieldOfView(fieldOfView: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(fieldOfView, 0, "fieldOfView");
		ArgumentOutOfRangeException.throwIfGreaterThanOrEqual(fieldOfView, Math.PI, "fieldOfView");

		this.fieldOfView = fieldOfView;
		this.invalidate();
	}

	public getNearDistance(): number {
		return this.nearDistance;
	}

	public setNearDistance(nearDistance: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(nearDistance, 0, "nearDistance");
		ArgumentOutOfRangeException.throwIfGreaterThanOrEqual(nearDistance, this.farDistance, "nearDistance");

		this.nearDistance = nearDistance;
		this.invalidate();
	}

	public getFarDistance(): number {
		return this.farDistance;
	}

	public setFarDistance(farDistance: number): void {
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(farDistance, 0, "farDistance");
		ArgumentOutOfRangeException.throwIfLessThanOrEqual(farDistance, this.nearDistance, "farDistance");

		this.farDistance = farDistance;
		this.invalidate();
	}

	public getMatrix(): readonly number[] {
		if (this.updated == false) {
			this.updateMatrix();
		}

		return this.matrix;
	}

	private updateMatrix(): void {
		const near: number = this.nearDistance;
		const far: number = this.farDistance;
		const invRange: number = -1.0 / (far - near);
		const f: number = Math.tan(Math.PI * 0.5 - this.fieldOfView * 0.5);

		this.matrix[0] = f / this.aspectRatio;
		this.matrix[1] = 0.0;
		this.matrix[2] = 0.0;
		this.matrix[3] = 0.0;
		this.matrix[4] = 0.0;
		this.matrix[5] = f;
		this.matrix[6] = 0.0;
		this.matrix[7] = 0.0;
		this.matrix[8] = 0.0;
		this.matrix[9] = 0.0;
		this.matrix[10] = (near + far) * invRange;
		this.matrix[11] = -1.0;
		this.matrix[12] = 0.0;
		this.matrix[13] = 0.0;
		this.matrix[14] = near * far * invRange * 2.0;
		this.matrix[15] = 0.0;

		this.updated = true;
	}

	private invalidate(): void {
		this.updated = false;
	}

}
