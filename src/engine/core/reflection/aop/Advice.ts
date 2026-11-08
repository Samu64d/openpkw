//
// Advice.ts
//

import Callable from "../../common/Callable.ts";
import Action from "./Action.ts";

export default abstract class Advice<T extends object, M extends Callable> {

	protected readonly action: Action<T>;

	public constructor(action: Action<T>) {
		this.action = action;
	}

	public getAction(): Action<T> {
		return this.action;
	}

	public abstract wrap(method: M): M;

}
