//
// Resource.ts
//

import Disposable from "../reflection/decorators/Disposable.ts";

@Disposable()
export default abstract class Resource<T> {

	protected readonly path: string;
	protected readonly resource: T;

	public constructor(path: string, resource: T) {
		this.path = path;
		this.resource = resource;
	}

	public getPath(): string {
		return this.path;
	}

	public get(): T {
		return this.resource;
	}

	public dispose(): void {

	}

}
