//
// AroundAdvice.ts
//

import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

class AroundAdvice<T extends Aspect, M extends AroundAdvice.Accept<T>> extends Advice<T, M> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(method: M): M {
		const aspect: T = this.aspect;
		return function (this: ThisParameterType<M>, ...args: Parameters<T>): ReturnType<M> {
			const proceed: (...proceedArgs: Parameters<T>) => ReturnType<M> = (...proceedArgs: Parameters<T>): ReturnType<M> => {
				return method.apply(this, proceedArgs.length > 0 ? proceedArgs : args as any);
			};

			return aspect.call(this, proceed, ...args);
		} as unknown as M;
	}

}

namespace AroundAdvice {

	export type Accept<T extends Aspect> = (proceed: (...args: Parameters<T>) => unknown, ...args: Parameters<T>) => any;

}

export default AroundAdvice;
