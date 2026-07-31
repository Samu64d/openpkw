//
// Disposable.ts
//

import ClassType from "../class/ClassType.ts";
import Aspect from "../aop/Aspect.ts";
import BeforeAdvice from "../aop/BeforeAdvice.ts";
import ClassAdviceApplier from "../aop/ClassAdviceApplier.ts";

function Disposable<T extends Disposable.Target, C extends ClassType<T>>(): (target: C) => void {
	return <C extends ClassType<T>>(target: C): void => {
		const applier: ClassAdviceApplier<Disposable.Target> = new ClassAdviceApplier(target);
		const disposeGuardAdvice: BeforeAdvice<Aspect, BeforeAdvice.Accept<Aspect>> = new BeforeAdvice(Disposable.DISPOSE_GUARD_ASPECT());
		const disposeAdvice: BeforeAdvice<Aspect, BeforeAdvice.Accept<Aspect>> = new BeforeAdvice(Disposable.DISPOSE_ASPECT());
		applier.applyToMethod("dispose", disposeAdvice);
		applier.applyToAllMethods(disposeGuardAdvice);
	};
}

namespace Disposable {

	export interface Target {

		[DISPOSED]?: boolean;

		dispose(): void;

	}

	const DISPOSED: unique symbol = Symbol("DISPOSED");

	export const DISPOSE_ASPECT = (): Aspect => {
		return function (this: Target): void {
			this[DISPOSED] = true;
		};
	};

	export const DISPOSE_GUARD_ASPECT = (): Aspect => {
		return function (this: Target, ...args: unknown[]): void {
			if (this[DISPOSED] == true) {
				throw new Error("Trying to access a disposed object.");
			}
		};
	};

	export function isDisposed<T extends Target>(target: T): boolean {
		return target[DISPOSED] == true;
	}

}

export default Disposable;
