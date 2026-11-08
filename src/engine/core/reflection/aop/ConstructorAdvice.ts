//
// ConstructorAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import Action from "./Action.ts";

export default abstract class ConstructorAdvice<T extends ClassType<object>> {

	protected readonly action: Action<InstanceType<T>>;

	public constructor(action: Action<InstanceType<T>>) {
		this.action = action;
	}

	public abstract wrap(classType: T): T;

}
