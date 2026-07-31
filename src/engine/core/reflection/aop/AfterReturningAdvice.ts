//
// AfterReturningAdvice.ts
//

import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

class AfterReturningAdvice<T extends Aspect, M extends AfterReturningAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(method: M): M {
		const aspect: T = this.aspect;
		return function (this: ThisParameterType<M>, ...args: Parameters<T>): ReturnType<M> {
			const returnValue = method.apply(this, args);
			aspect.apply(this, args);
			return returnValue;
		} as unknown as M;
	}

}

namespace AfterReturningAdvice {

	export type Accept<T extends Aspect> = (...args: Parameters<T>) => any;

}

export default AfterReturningAdvice;
