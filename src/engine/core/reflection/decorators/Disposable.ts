//
// Disposable.ts
//

import Consumer from "../../common/Consumer.ts";
import InvalidOperationException from "../../exception/InvalidOperationException.ts";
import ClassType from "../class/ClassType.ts";
import Action from "../aop/Action.ts";
import BeforeAdvice from "../aop/BeforeAdvice.ts";
import ClassAspects from "../aop/ClassAspects.ts";

function Disposable<T extends Disposable.Target, C extends ClassType<T>>(): Consumer<C> {
	return function (target: C): void {
		const aspects: ClassAspects<Disposable.Target> = new ClassAspects(target);
		const disposeAdvice: BeforeAdvice<Disposable.Target> = new BeforeAdvice(Disposable.DISPOSE_ACTION());
		const disposeGuardAdvice: BeforeAdvice<Disposable.Target> = new BeforeAdvice(Disposable.DISPOSE_GUARD_ACTION());

		aspects.applyToMethod("dispose", disposeAdvice);
		aspects.applyToAllMethods(disposeGuardAdvice);
	};
}

namespace Disposable {

	export interface Target {

		[DISPOSED]?: boolean;

		dispose(): void;

	}

	const DISPOSED: unique symbol = Symbol("DISPOSED");

	export const DISPOSE_ACTION = <T extends Target>(): Action<T> => {
		return function (this: T): void {
			this[DISPOSED] = true;
		};
	};

	export const DISPOSE_GUARD_ACTION = <T extends Target>(): Action<T> => {
		return function (this: T, ...args: any[]): void {
			if (this[DISPOSED] == true) {
				throw new InvalidOperationException("Trying to access a disposed object");
			}
		};
	};

	export function isDisposed<T extends Target>(target: T): boolean {
		return target[DISPOSED] == true;
	}

}

export default Disposable;
