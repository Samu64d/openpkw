// 
// Matrix4d.ts
//

export default class Matrix4d {

	public constructor() {

	}

}

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
