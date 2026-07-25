// 
// Vector3d.ts
//

import Nullable from "../foundation/Nullable.ts";

export default class Vector3d {

	public static readonly ZERO = (): Vector3d => {
		return new Vector3d(0, 0, 0);
	};

	public static readonly ONE = (): Vector3d => {
		return new Vector3d(1.0, 1.0, 1.0);
	};

	private x: number;
	private y: number;
	private z: number;
	private length: Nullable<number>;

	public constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.length = null;
	}

	public getX(): number {
		return this.x;
	}

	public setX(x: number): Vector3d {
		return this.set(x, this.y, this.z);
	}

	public getY(): number {
		return this.y;
	}

	public setY(y: number): Vector3d {
		return this.set(this.x, y, this.z);
	}

	public getZ(): number {
		return this.z;
	}

	public setZ(z: number): Vector3d {
		return this.set(this.x, this.y, z);
	}

	public set(x: number, y: number, z: number): Vector3d {
		this.x = x;
		this.y = y;
		this.z = z;
		this.length = null;
		return this;
	}

	public setWith(vector3d: Vector3d): Vector3d {
		return this.set(vector3d.x, vector3d.y, vector3d.z);
	}

	public addX(x: number): Vector3d {
		return this.set(this.x + x, this.y, this.z);
	}

	public addY(y: number): Vector3d {
		return this.set(this.x, this.y + y, this.z);
	}

	public addZ(z: number): Vector3d {
		return this.set(this.x, this.y, this.z + z);
	}

	public add(x: number, y: number, z: number): Vector3d {
		return this.set(this.x + x, this.y + y, this.z + z);
	}

	public addWith(vector3d: Vector3d): Vector3d {
		return this.set(this.x + vector3d.getX(), this.y + vector3d.getY(), this.z + vector3d.getZ());
	}

	public subX(x: number): Vector3d {
		return this.set(this.x - x, this.y, this.z);
	}

	public subY(y: number): Vector3d {
		return this.set(this.x, this.y - y, this.z);
	}

	public subZ(z: number): Vector3d {
		return this.set(this.x, this.y, this.z - z);
	}

	public sub(x: number, y: number, z: number): Vector3d {
		return this.set(this.x - x, this.y - y, this.z - z);
	}

	public subWith(vector3d: Vector3d): Vector3d {
		return this.set(this.x - vector3d.getX(), this.y - vector3d.getY(), this.z - vector3d.getZ());
	}

	public mul(value: number): Vector3d {
		return this.set(this.x * value, this.y * value, this.z * value);
	}

	public negateX(): Vector3d {
		return this.set(-this.x, this.y, this.z);
	}

	public negateY(): Vector3d {
		return this.set(this.x, -this.y, this.z);
	}

	public negateZ(): Vector3d {
		return this.set(this.x, this.y, -this.z);
	}

	public negate(): Vector3d {
		return this.set(-this.x, -this.y, -this.z);
	}

	public normalize(): Vector3d {
		const length: number = this.getLength();

		if (length != 0) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
			this.length = 1;
		}

		return this;
	}

	public getLength(): number {
		if (this.length == null) {
			this.length = Math.hypot(this.x, this.y, this.z);
		}
		return this.length;
	}

	public getLengthSquared(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	public getDistance(vector3d: Vector3d): number {
		return Math.hypot(this.x - vector3d.x, this.y - vector3d.y, this.z - vector3d.z);
	}

	public getDistanceSquared(vector3d: Vector3d): number {
		const x: number = this.x - vector3d.x;
		const y: number = this.y - vector3d.y;
		const z: number = this.z - vector3d.z;
		return x * x + y * y + z * z;
	}

	public dot(vector3d: Vector3d): number {
		return this.x * vector3d.x + this.y * vector3d.y + this.z * vector3d.z;
	}

	public cross(vector3d: Vector3d): Vector3d {
		return this.set(this.y * vector3d.z - this.z * vector3d.y, this.z * vector3d.x - this.x * vector3d.z, this.x * vector3d.y - this.y * vector3d.x);
	}

	public clone(): Vector3d {
		return new Vector3d(this.x, this.y, this.z);
	}

	public equals(vector3d: Vector3d): boolean {
		return this.x == vector3d.x && this.y == vector3d.y && this.z == vector3d.z;
	}

}
