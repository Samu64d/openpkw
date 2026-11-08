//
// Record.ts
//

import Function from "../../common/Function.ts";
import ClassType from "../class/ClassType.ts";
import Action from "../aop/Action.ts";
import ConstructorAfterReturningAdvice from "../aop/ConstructorAfterReturningAdvice.ts";

function Record<T extends object, C extends ClassType<T>>(): Function<C, C> {
	return function (target: C): C {
		const recordAdvice: ConstructorAfterReturningAdvice<C> = new ConstructorAfterReturningAdvice<C>(Record.RECORD_ACTION());

		return recordAdvice.wrap(target);
	};
}

namespace Record {

	export const RECORD_ACTION = <T extends object>(): Action<T> => {
		return (instance: T): void => {
			Object.freeze(instance);
		};
	};

}

export default Record;
