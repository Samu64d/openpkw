//
// AfterFinallyAdvice.ts
//

import Action from "./Action.ts";
import Advice from "./Advice.ts";

class AfterFinallyAdvice<T extends object, M extends AfterFinallyAdvice.Accept = AfterFinallyAdvice.Accept> extends Advice<T, M> {

	public constructor(action: Action<T>) {
		super(action);
	}

	public override wrap(method: M): M {
		const action: Action<T> = this.action;

		return function (this: T, ...args: Parameters<M>): ReturnType<M> {
			let returnValue: ReturnType<M>;

			try {
				returnValue = method.apply(this, args);
			} finally {
				action.apply(this, args);
			}

			return returnValue;
		} as M;
	}

}

namespace AfterFinallyAdvice {

	export interface Accept {

		(...args: any[]): any;

	}

}

export default AfterFinallyAdvice;
