//
// ConstructorAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import Aspect from "./Aspect.ts";

export default abstract class ConstructorAdvice<T extends Aspect, C extends ClassType<object>> {

	protected readonly aspect: T;

	public constructor(aspect: T) {
		this.aspect = aspect;
	}

	public abstract wrap(classType: C): C;

}
