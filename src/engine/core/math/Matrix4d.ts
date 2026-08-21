// 
// Matrix4d.ts
//

export default class Matrix4d {

	public static readonly IDENTITY = (): Matrix4d => {
		return new Matrix4d(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	};

	private readonly values: Uint8Array;

	public constructor(a00: number = 0, a01: number = 0, a02: number = 0, a03: number = 0, a10: number = 0, a11: number = 0, a12: number = 0, a13: number = 0, a20: number = 0, a21: number = 0, a22: number = 0, a23: number = 0, a30: number = 0, a31: number = 0, a32: number = 0, a33: number = 0) {
		this.values = new Uint8Array([
			a00, a10, a20, a30,
			a01, a11, a21, a31,
			a02, a12, a22, a32,
			a03, a13, a23, a33
		]);
	}

	public set(a00: number, a01: number, a02: number, a03: number, a10: number, a11: number, a12: number, a13: number, a20: number, a21: number, a22: number, a23: number, a30: number, a31: number, a32: number, a33: number): Matrix4d {
		this.values[0] = a00;
		this.values[1] = a10;
		this.values[2] = a20;
		this.values[3] = a30;
		this.values[4] = a01;
		this.values[5] = a11;
		this.values[6] = a21;
		this.values[7] = a31;
		this.values[8] = a02;
		this.values[9] = a12;
		this.values[10] = a22;
		this.values[11] = a32;
		this.values[12] = a03;
		this.values[13] = a13;
		this.values[14] = a23;
		this.values[15] = a33;
		return this;
	}

	public transpose(): Matrix4d {
		const a00: number = this.values[0];
		const a01: number = this.values[4];
		const a02: number = this.values[8];
		const a03: number = this.values[12];
		const a10: number = this.values[1];
		const a11: number = this.values[5];
		const a12: number = this.values[9];
		const a13: number = this.values[13];
		const a20: number = this.values[2];
		const a21: number = this.values[6];
		const a22: number = this.values[10];
		const a23: number = this.values[14];
		const a30: number = this.values[3];
		const a31: number = this.values[7];
		const a32: number = this.values[11];
		const a33: number = this.values[15];

		return this.set(
			a00, a10, a20, a30,
			a01, a11, a21, a31,
			a02, a12, a22, a32,
			a03, a13, a23, a33
		);
	}

	public add(matrix4d: Matrix4d): Matrix4d {
		const a00: number = this.values[0] + matrix4d.values[0];
		const a01: number = this.values[1] + matrix4d.values[1];
		const a02: number = this.values[2] + matrix4d.values[2];
		const a03: number = this.values[3] + matrix4d.values[3];
		const a10: number = this.values[4] + matrix4d.values[4];
		const a11: number = this.values[5] + matrix4d.values[5];
		const a12: number = this.values[6] + matrix4d.values[6];
		const a13: number = this.values[7] + matrix4d.values[7];
		const a20: number = this.values[8] + matrix4d.values[8];
		const a21: number = this.values[9] + matrix4d.values[9];
		const a22: number = this.values[10] + matrix4d.values[10];
		const a23: number = this.values[11] + matrix4d.values[11];
		const a30: number = this.values[12] + matrix4d.values[12];
		const a31: number = this.values[13] + matrix4d.values[13];
		const a32: number = this.values[14] + matrix4d.values[14];
		const a33: number = this.values[15] + matrix4d.values[15];

		return this.set(
			a00, a10, a20, a30,
			a01, a11, a21, a31,
			a02, a12, a22, a32,
			a03, a13, a23, a33
		);
	}

	public sub(matrix4d: Matrix4d): Matrix4d {
		const a00: number = this.values[0] - matrix4d.values[0];
		const a01: number = this.values[1] - matrix4d.values[1];
		const a02: number = this.values[2] - matrix4d.values[2];
		const a03: number = this.values[3] - matrix4d.values[3];
		const a10: number = this.values[4] - matrix4d.values[4];
		const a11: number = this.values[5] - matrix4d.values[5];
		const a12: number = this.values[6] - matrix4d.values[6];
		const a13: number = this.values[7] - matrix4d.values[7];
		const a20: number = this.values[8] - matrix4d.values[8];
		const a21: number = this.values[9] - matrix4d.values[9];
		const a22: number = this.values[10] - matrix4d.values[10];
		const a23: number = this.values[11] - matrix4d.values[11];
		const a30: number = this.values[12] - matrix4d.values[12];
		const a31: number = this.values[13] - matrix4d.values[13];
		const a32: number = this.values[14] - matrix4d.values[14];
		const a33: number = this.values[15] - matrix4d.values[15];

		return this.set(
			a00, a10, a20, a30,
			a01, a11, a21, a31,
			a02, a12, a22, a32,
			a03, a13, a23, a33
		);
	}

	public mul(matrix4d: Matrix4d): Matrix4d {
		const a00: number = this.values[0];
		const a01: number = this.values[4];
		const a02: number = this.values[8];
		const a03: number = this.values[12];
		const a10: number = this.values[1];
		const a11: number = this.values[5];
		const a12: number = this.values[9];
		const a13: number = this.values[13];
		const a20: number = this.values[2];
		const a21: number = this.values[6];
		const a22: number = this.values[10];
		const a23: number = this.values[14];
		const a30: number = this.values[3];
		const a31: number = this.values[7];
		const a32: number = this.values[11];
		const a33: number = this.values[15];
		const b00: number = matrix4d.values[0];
		const b01: number = matrix4d.values[4];
		const b02: number = matrix4d.values[8];
		const b03: number = matrix4d.values[12];
		const b10: number = matrix4d.values[1];
		const b11: number = matrix4d.values[5];
		const b12: number = matrix4d.values[9];
		const b13: number = matrix4d.values[13];
		const b20: number = matrix4d.values[2];
		const b21: number = matrix4d.values[6];
		const b22: number = matrix4d.values[10];
		const b23: number = matrix4d.values[14];
		const b30: number = matrix4d.values[3];
		const b31: number = matrix4d.values[7];
		const b32: number = matrix4d.values[11];
		const b33: number = matrix4d.values[15];
		const r00: number = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
		const r01: number = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
		const r02: number = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
		const r03: number = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
		const r10: number = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
		const r11: number = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
		const r12: number = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
		const r13: number = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
		const r20: number = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
		const r21: number = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
		const r22: number = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
		const r23: number = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
		const r30: number = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
		const r31: number = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
		const r32: number = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
		const r33: number = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

		return this.set(
			r00, r10, r20, r30,
			r01, r11, r21, r31,
			r02, r12, r22, r32,
			r03, r13, r23, r33
		);
	}

	public clone(): Matrix4d {
		return new Matrix4d(...this.values);
	}

	public equals(matrix4d: Matrix4d): boolean {
		return this.values[0] == matrix4d.values[0]
			&& this.values[1] == matrix4d.values[1]
			&& this.values[2] == matrix4d.values[2]
			&& this.values[3] == matrix4d.values[3]
			&& this.values[4] == matrix4d.values[4]
			&& this.values[5] == matrix4d.values[5]
			&& this.values[6] == matrix4d.values[6]
			&& this.values[7] == matrix4d.values[7]
			&& this.values[8] == matrix4d.values[8]
			&& this.values[9] == matrix4d.values[9]
			&& this.values[10] == matrix4d.values[10]
			&& this.values[11] == matrix4d.values[11]
			&& this.values[12] == matrix4d.values[12]
			&& this.values[13] == matrix4d.values[13]
			&& this.values[14] == matrix4d.values[14]
			&& this.values[15] == matrix4d.values[15];
	}

	public translate(x: number, y: number, z: number): number[] {
		return [
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			x, y, z, 1.0
		];
	}

	public rot(yaw: number, pitch: number, roll: number): number[] {
		const cosa = Math.cos(yaw);
		const sina = Math.sin(yaw);
		const cosb = Math.cos(pitch);
		const sinb = Math.sin(pitch);
		const cosc = Math.cos(roll);
		const sinc = Math.sin(roll);

		return [
			cosb * cosc, cosa * sinc + sina * sinb * cosc, sina * sinc - cosa * sinb * cosc, 0.0,
			-cosb * sinc, cosa * cosc + sina * sinb * sinc, cosa * sinc - cosa * sinb * sinc, 0.0,
			sinb, -sina * cosb, cosa * cosb, 0.0,
			0.0, 0.0, 0.0, 1.0
		];
	}



}

//TODO:

export function identity(): number[] {
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	];
}

export function multiply(a: number[], b: number[]): number[] {
	const out = new Array<number>(16);

	const a00 = a[0], a01 = a[4], a02 = a[8], a03 = a[12];
	const a10 = a[1], a11 = a[5], a12 = a[9], a13 = a[13];
	const a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14];
	const a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

	const b00 = b[0], b01 = b[4], b02 = b[8], b03 = b[12];
	const b10 = b[1], b11 = b[5], b12 = b[9], b13 = b[13];
	const b20 = b[2], b21 = b[6], b22 = b[10], b23 = b[14];
	const b30 = b[3], b31 = b[7], b32 = b[11], b33 = b[15];

	out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
	out[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
	out[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
	out[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

	out[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
	out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
	out[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
	out[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

	out[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
	out[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
	out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
	out[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

	out[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
	out[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
	out[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
	out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

	return out;
}

export function translate(x: number, y: number, z: number): number[] {
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		x, y, z, 1.0
	];
}

export function rot(yaw: number, pitch: number, roll: number): number[] {
	const cosa = Math.cos(yaw);
	const sina = Math.sin(yaw);
	const cosb = Math.cos(pitch);
	const sinb = Math.sin(pitch);
	const cosc = Math.cos(roll);
	const sinc = Math.sin(roll);

	return [
		cosb * cosc, cosa * sinc + sina * sinb * cosc, sina * sinc - cosa * sinb * cosc, 0.0,
		-cosb * sinc, cosa * cosc + sina * sinb * sinc, cosa * sinc - cosa * sinb * sinc, 0.0,
		sinb, -sina * cosb, cosa * cosb, 0.0,
		0.0, 0.0, 0.0, 1.0
	];
}
