//
// BeforeAdvice.ts
//

import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

class BeforeAdvice<T extends Aspect, M extends BeforeAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(method: M): M {
		const aspect: T = this.aspect;
		return function (this: ThisParameterType<M>, ...args: Parameters<T>): ReturnType<M> {
			aspect.apply(this, args);
			return method.apply(this, args);
		} as unknown as M;
	}

}

namespace BeforeAdvice {

	export type Accept<T extends Aspect> = (...args: Parameters<T>) => any;

}

export default BeforeAdvice;
