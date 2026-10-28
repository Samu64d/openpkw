//
// ApplicationContents.ts
//

import Record from "../core/reflection/decorators/Record.ts";

@Record()
export default class ApplicationContents {

	private readonly entryPointPath: string;
	private readonly dataUrl: string;
	private readonly baseUrl: string;

	public constructor(entryPointPath: string, dataUrl: string, baseUrl: string) {
		this.entryPointPath = entryPointPath;
		this.dataUrl = dataUrl;
		this.baseUrl = baseUrl;
	}

	public getEntryPointPath(): string {
		return this.entryPointPath;
	}

	public getDataUrl(): string {
		return this.dataUrl;
	}

	public getBaseUrl(): string {
		return this.baseUrl;
	}

}
