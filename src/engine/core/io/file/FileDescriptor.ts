//
// FileDescriptor.ts
//

import Record from "../../reflection/decorators/Record.ts";

@Record()
export default class FileDescriptor {

	private readonly id: number;

	public constructor(id: number) {
		this.id = id;
	}

	public getId(): number {
		return this.id;
	}

}
