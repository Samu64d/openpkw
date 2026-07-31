//
// Resource.ts
//

import Nullable from "../../common/Nullable.ts";
import Disposable from "../../reflection/decorators/Disposable.ts";
import Loader from "../loader/Loader.ts";

@Disposable()
export default class Resource<L, R> implements Disposable.Target {

	protected readonly locator: L;
	protected readonly loader: Loader<L, R>;
	protected loaded: boolean;
	protected resource: Nullable<R>;

	public constructor(locator: L, loader: Loader<L, R>) {
		this.locator = locator;
		this.loader = loader;
		this.loaded = false;
		this.resource = null;
	}

	public getLocator(): L {
		return this.locator;
	}

	public getLoader(): Loader<L, R> {
		return this.loader;
	}

	public isLoaded(): boolean {
		return this.loaded;
	}

	public load(): void {
		if (this.loaded == false) {
			this.resource = this.loader.load(this.locator);
			this.loaded = true;
		}
	}

	public get(): R {
		if (this.loaded == false) {
			throw new Error("Try getting a resource that is not load.");
		}
		return this.resource as R;
	}

	public dispose(): void { }

}
