//
// AfterFinallyAdvice.ts
//

import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

class AfterFinallyAdvice<T extends Aspect, M extends AfterFinallyAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(method: M): M {
		const aspect: T = this.aspect;
		return function (this: ThisParameterType<M>, ...args: Parameters<T>): ReturnType<M> {
			let returnValue: ReturnType<M>;
			try {
				returnValue = method.apply(this, args);
			} finally {
				aspect.apply(this, args);
			}
			return returnValue;
		} as unknown as M;
	}

}

namespace AfterFinallyAdvice {

	export type Accept<T extends Aspect> = (...args: Parameters<T>) => any;

}

export default AfterFinallyAdvice;
