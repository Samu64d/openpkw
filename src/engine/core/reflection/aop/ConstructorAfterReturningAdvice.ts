//
// ConstructorAfterReturningAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import ConstructorAction from "./ConstructorAction.ts";
import ConstructorAdvice from "./ConstructorAdvice.ts";

class ConstructorAfterReturningAdvice<T extends ClassType<object>> extends ConstructorAdvice<T> {

	public constructor(action: ConstructorAction<InstanceType<T>>) {
		super(action);
	}

	public override wrap(classType: T): T {
		const action: ConstructorAction<InstanceType<T>> = this.action;

		return class extends classType {

			public constructor(...args: any[]) {
				super(...args);

				action.call(this as InstanceType<T>);
			}

		} as T;
	}

}

export default ConstructorAfterReturningAdvice;
