//
// Record.ts
//

import Consumer from "../../common/Consumer.ts";
import Function from "../../common/Function.ts";
import ClassType from "../class/ClassType.ts";
import ConstructorAfterReturningAdvice from "../aop/ConstructorAfterReturningAdvice.ts";

function Record<T extends object, C extends ClassType<T>>(): Function<C, C> {
	return <C extends ClassType<T>>(target: C): C => {
		const recordAdvice = new ConstructorAfterReturningAdvice<Consumer<T>, C>(Record.RECORD_ASPECT<T>());

		return recordAdvice.wrap(target);
	};
}

namespace Record {

	export const RECORD_ASPECT = <T extends object>(): Consumer<T> => {
		return (instance: T): void => {
			Object.freeze(instance);
		};
	};

}

export default Record;
