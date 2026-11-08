//
// AfterReturningAdvice.ts
//

import Action from "./Action.ts";
import Advice from "./Advice.ts";

class AfterReturningAdvice<T extends object, M extends AfterReturningAdvice.Accept> extends Advice<T, AfterReturningAdvice.Accept> {

	public constructor(action: Action<T>) {
		super(action);
	}

	public override wrap(method: M): M {
		const action: Action<T> = this.action;

		return function (this: T, ...args: Parameters<M>): ReturnType<M> {
			const returnValue: ReturnType<M> = method.apply(this, args);

			action.apply(this, args);
			return returnValue;
		} as M;
	}

}

namespace AfterReturningAdvice {

	export interface Accept {

		(...args: any[]): any;

	}

}

export default AfterReturningAdvice;
