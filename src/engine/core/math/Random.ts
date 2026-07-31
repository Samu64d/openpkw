// 
// Random.ts
//

export default class Random {

	public static float(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

}
