//
// TextFileResource.ts
//

import Nullable from "../foundation/Nullable.ts";
import FileSystem from "../platform/FileSystem.ts";
import Resource from "./Resource.ts";

export default class TextFileResource extends Resource<string> {

	private content: Nullable<string>;

	public constructor(path: string) {
		super(path);
		this.content = null;
	}

	public override load(): void {
		this.content = FileSystem.readTextFile(this.path);
		this.loaded = true;
	}

	public override getContent(): string {
		if (this.loaded == false) {
			throw new Error("Try getting a resource that was not loaded.");
		}
		return this.content as string;
	}

}
