//
// ConstructorAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import ConstructorAction from "./ConstructorAction.ts";

export default abstract class ConstructorAdvice<T extends ClassType<object>> {

	protected readonly action: ConstructorAction<InstanceType<T>>;

	public constructor(action: ConstructorAction<InstanceType<T>>) {
		this.action = action;
	}

	public abstract wrap(classType: T): T;

}
