// 
// Projection.ts
//

export default class Projection {

	private aspectRatio: number;
	private fieldOfView: number;
	private nearDistance: number;
	private farDistance: number;
	private readonly matrix: number[];
	private updated: boolean;

	public constructor(aspectRatio: number, fieldOfView: number, nearDistance: number, farDistance: number) {
		if (aspectRatio <= 0) {
			throw new Error("Aspect ratio value must be greater than zero.");
		}
		if (fieldOfView <= 0 || fieldOfView >= Math.PI) {
			throw new Error("Field of view value must be between greater than zero and PI.");
		}
		if (nearDistance <= 0 || farDistance <= 0 || farDistance <= nearDistance) {
			throw new Error("Invalid distance values.");
		}

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
		if (aspectRatio <= 0) {
			throw new Error("Aspect ratio value must be greater than zero.");
		}
		this.aspectRatio = aspectRatio;
		this.invalidate();
	}

	public getFieldOfView(): number {
		return this.fieldOfView;
	}

	public setFieldOfView(fieldOfView: number): void {
		if (fieldOfView <= 0 || fieldOfView >= Math.PI) {
			throw new Error("Field of view value must be between greater than zero and PI.");
		}
		this.fieldOfView = fieldOfView;
		this.invalidate();
	}

	public getNearDistance(): number {
		return this.nearDistance;
	}

	public setNearDistance(nearDistance: number): void {
		if (nearDistance <= 0 || nearDistance >= this.farDistance) {
			throw new Error("Invalid near distance value.");
		}
		this.nearDistance = nearDistance;
		this.invalidate();
	}

	public getFarDistance(): number {
		return this.farDistance;
	}

	public setFarDistance(farDistance: number): void {
		if (farDistance <= 0 || farDistance <= this.nearDistance) {
			throw new Error("Invalid far distance value.");
		}
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
