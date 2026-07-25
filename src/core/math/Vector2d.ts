// 
// Vector2d.ts
//

import Nullable from "../foundation/Nullable.ts";

export default class Vector2d {

	public static readonly ZERO = (): Vector2d => {
		return new Vector2d(0, 0);
	};

	public static readonly ONE = (): Vector2d => {
		return new Vector2d(1.0, 1.0);
	};

	private x: number;
	private y: number;
	private length: Nullable<number>;

	public constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
		this.length = null;
	}

	public getX(): number {
		return this.x;
	}

	public setX(x: number): Vector2d {
		return this.set(x, this.y);
	}

	public getY(): number {
		return this.y;
	}

	public setY(y: number): Vector2d {
		return this.set(this.x, y);
	}

	public set(x: number, y: number): Vector2d {
		this.x = x;
		this.y = y;
		this.length = null;
		return this;
	}

	public setWith(vector2d: Vector2d): Vector2d {
		return this.set(vector2d.x, vector2d.y);
	}

	public addX(x: number): Vector2d {
		return this.set(this.x + x, this.y);
	}

	public addY(y: number): Vector2d {
		return this.set(this.x, this.y + y);
	}

	public add(x: number, y: number): Vector2d {
		return this.set(this.x + x, this.y + y);
	}

	public addWith(vector2d: Vector2d): Vector2d {
		return this.set(this.x + vector2d.getX(), this.y + vector2d.getY());
	}

	public subX(x: number): Vector2d {
		return this.set(this.x - x, this.y);
	}

	public subY(y: number): Vector2d {
		return this.set(this.x, this.y - y);
	}

	public sub(x: number, y: number): Vector2d {
		return this.set(this.x - x, this.y - y);
	}

	public subWith(vector2d: Vector2d): Vector2d {
		return this.set(this.x - vector2d.getX(), this.y - vector2d.getY());
	}

	public mul(value: number): Vector2d {
		return this.set(this.x * value, this.y * value);
	}

	public negateX(): Vector2d {
		return this.set(-this.x, this.y);
	}

	public negateY(): Vector2d {
		return this.set(this.x, -this.y);
	}

	public negate(): Vector2d {
		return this.set(-this.x, -this.y);
	}

	public normalize(): Vector2d {
		const length: number = this.getLength();

		if (length != 0) {
			this.x /= length;
			this.y /= length;
			this.length = 1;
		}

		return this;
	}

	public getLength(): number {
		if (this.length == null) {
			this.length = Math.hypot(this.x, this.y);
		}
		return this.length;
	}

	public getLengthSquared(): number {
		return this.x * this.x + this.y * this.y;
	}

	public getDistance(vector2d: Vector2d): number {
		return Math.hypot(this.x - vector2d.x, this.y - vector2d.y);
	}

	public getDistanceSquared(vector2d: Vector2d): number {
		const x: number = this.x - vector2d.x;
		const y: number = this.y - vector2d.y;
		return x * x + y * y;
	}

	public dot(vector2d: Vector2d): number {
		return this.x * vector2d.x + this.y * vector2d.y;
	}

	public clone(): Vector2d {
		return new Vector2d(this.x, this.y);
	}

	public equals(vector2d: Vector2d): boolean {
		return this.x == vector2d.x && this.y == vector2d.y;
	}

}
