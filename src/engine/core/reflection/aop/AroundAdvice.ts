//
// AroundAdvice.ts
//

import AroundAction from "./AroundAction.ts";
import Advice from "./Advice.ts";

class AroundAdvice<T extends object, M extends AroundAdvice.Accept<T> = AroundAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(action: AroundAction<T>) {
		super(action);
	}

	public override wrap(method: M): M {
		const action: AroundAction<T> = this.action;

		return function (this: ThisParameterType<M>, ...args: Parameters<M>): ReturnType<M> {
			const proceed: (...proceedArgs: Parameters<M>) => ReturnType<M> = (...proceedArgs: Parameters<M>): ReturnType<M> => {
				return method.apply(this, proceedArgs.length > 0 ? proceedArgs : args);
			};

			return action.call(this, proceed, ...args);
		} as M;
	}

}

namespace AroundAdvice {

	export interface Accept<T> {

		(this: T, proceed: (...args: any[]) => any, ...args: any[]): any;

	}

}

export default AroundAdvice;
