//
// Record.ts
//

import ClassType from "../class/ClassType.ts";
import ConstructorAfterReturningAdvice from "../aop/ConstructorAfterReturningAdvice.ts";

function Record<T extends object, C extends ClassType<T>>(): (target: C) => C {
	return <C extends ClassType<T>>(target: C): C => {
		const recordAdvice = new ConstructorAfterReturningAdvice<(instance: T) => void, C>(Record.RECORD_ASPECT<T>());
		return recordAdvice.wrap(target);
	};
}

namespace Record {

	export const RECORD_ASPECT = <T extends object>(): (instance: T) => void => {
		return (instance: T): void => {
			Object.freeze(instance);
		};
	};

}

export default Record;
