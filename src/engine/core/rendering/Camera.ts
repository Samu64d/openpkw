// 
// Camera.ts
//

import Vector3d from "../math/Vector3d.ts";

export default class Camera {

	private static readonly UP: Vector3d = new Vector3d(0, 1, 0);

	private readonly position: Vector3d;
	private readonly target: Vector3d;
	private readonly xAxis: Vector3d;
	private readonly yAxis: Vector3d;
	private readonly zAxis: Vector3d;
	private readonly matrix: number[];
	private updated: boolean;

	public constructor(position: Vector3d = Vector3d.ZERO()) {
		this.position = position;
		this.target = new Vector3d();
		this.xAxis = new Vector3d();
		this.yAxis = new Vector3d();
		this.zAxis = new Vector3d();
		this.matrix = new Array<number>(16);
		this.updated = false;
		this.updateMatrix();
	}

	public getPosition(): Vector3d {
		return this.position;
	}

	public setPosition(position: Vector3d): void {
		this.position.setWith(position);
		this.invalidate();
	}

	public getTarget(): Vector3d {
		return this.target;
	}

	public setTarget(target: Vector3d): void {
		this.target.setWith(target);
		this.invalidate();
	}

	public lookAt(position: Vector3d, target: Vector3d): void {
		this.position.setWith(position);
		this.target.setWith(target);
		this.invalidate();
	}

	public getMatrix(): readonly number[] {
		if (this.updated == false) {
			this.updateMatrix();
		}
		return this.matrix;
	}

	private updateMatrix(): void {
		this.zAxis.setWith(this.position).subWith(this.target).normalize();
		this.xAxis.setWith(Camera.UP).cross(this.zAxis).normalize();
		this.yAxis.setWith(this.zAxis).cross(this.xAxis).normalize();

		this.matrix[0] = this.xAxis.getX();
		this.matrix[1] = this.yAxis.getX();
		this.matrix[2] = this.zAxis.getX();
		this.matrix[3] = 0.0;
		this.matrix[4] = this.xAxis.getY();
		this.matrix[5] = this.yAxis.getY();
		this.matrix[6] = this.zAxis.getY();
		this.matrix[7] = 0.0;
		this.matrix[8] = this.xAxis.getZ();
		this.matrix[9] = this.yAxis.getZ();
		this.matrix[10] = this.zAxis.getZ();
		this.matrix[11] = 0.0;
		this.matrix[12] = -this.xAxis.dot(this.position);
		this.matrix[13] = -this.yAxis.dot(this.position);
		this.matrix[14] = -this.zAxis.dot(this.position);
		this.matrix[15] = 1.0;

		this.updated = true;
	}

	private invalidate(): void {
		this.updated = false;
	}

}
