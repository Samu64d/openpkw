//
// Text.ts
//

import Record from "../reflection/decorators/Record.ts";

@Record()
export default class Text {

	private readonly data: string;

	public constructor(data: string) {
		this.data = data;
	}

	public getText(): string {
		return this.data;
	}

	public getLength(): number {
		return this.data.length;
	}

	public isEmpty(): boolean {
		return this.data == "";
	}

	public toUpperCase(): Text {
		return new Text(this.data.toUpperCase());
	}

	public toLowerCase(): Text {
		return new Text(this.data.toLowerCase());
	}

	public clone(): Text {
		return new Text(this.data);
	}

	public equals(text: Text): boolean {
		return this.data == text.data;
	}

}
