//
// BeforeAdvice.ts
//

import Action from "./Action.ts";
import Advice from "./Advice.ts";

class BeforeAdvice<T extends object, M extends BeforeAdvice.Accept = BeforeAdvice.Accept> extends Advice<T, M> {

	public constructor(action: Action<T>) {
		super(action);
	}

	public override wrap(method: M): M {
		const action: Action<T> = this.action;

		return function (this: T, ...args: Parameters<M>): ReturnType<M> {
			action.apply(this, args);

			return method.apply(this, args);
		} as M;
	}

}

namespace BeforeAdvice {

	export interface Accept {

		(...args: any[]): any;

	}

}

export default BeforeAdvice;
