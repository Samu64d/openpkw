//
// ConstructorAfterReturningAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import Action from "./Action.ts";
import ConstructorAdvice from "./ConstructorAdvice.ts";

class ConstructorAfterReturningAdvice<T extends ClassType<object>> extends ConstructorAdvice<T> {

	public constructor(action: Action<InstanceType<T>>) {
		super(action);
	}

	public override wrap(classType: T): T {
		const action: Action<InstanceType<T>> = this.action;

		return class extends classType {

			public constructor(...args: any[]) {
				super(...args);

				action(this);
			}

		} as T;
	}

}

export default ConstructorAfterReturningAdvice;
