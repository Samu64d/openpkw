//
// ReturnValueAdvice.ts
//

import ReturnValueAction from "./ReturnValueAction.ts";
import Advice from "./Advice.ts";

class ReturnValueAdvice<T extends object, R, M extends ReturnValueAdvice.Accept<R> = ReturnValueAdvice.Accept<R>> extends Advice<T, M> {

	declare protected readonly action: ReturnValueAction<T, R>;

	public constructor(action: ReturnValueAction<T, R>) {
		super(action);
	}

	public override wrap(method: M): M {
		const action: ReturnValueAction<T, R> = this.action;

		return function (this: T, ...args: Parameters<M>): ReturnType<M> {
			const returnValue: R = method.apply(this, args);

			return action.call(this, returnValue);
		} as M;
	}

}

namespace ReturnValueAdvice {

	export interface Accept<R> {

		(...args: any[]): R;

	}

}

export default ReturnValueAdvice;
