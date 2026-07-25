//
// Text.ts
//

export default class Text {

	public readonly length: number;
	public readonly data: string;

	public constructor(length: number, data: string) {
		this.length = length;
		this.data = data;
	}

	public getLength(): number {
		return this.length;
	}

	public getData(): string {
		return this.data;
	}

}
