//
// ReturnValueAdvice.ts
//

import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

class ReturnValueAdvice<T extends ReturnValueAdvice.Signature<T>, M extends ReturnValueAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(method: M): M {
		const aspect: T = this.aspect;
		return function (this: ThisParameterType<M>, ...args: Parameters<M>): ReturnType<T> {
			const returnValue: ReturnType<T> = method.apply(this, args);
			return aspect.call(this, returnValue);
		} as unknown as M;
	}

}

namespace ReturnValueAdvice {

	export type Signature<T extends Aspect> = (value: ReturnType<T>) => ReturnType<T>;

	export type Accept<T extends Aspect> = (...args: unknown[]) => Parameters<T>[0];

}

export default ReturnValueAdvice;
