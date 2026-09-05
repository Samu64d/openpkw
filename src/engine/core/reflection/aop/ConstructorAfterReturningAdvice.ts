//
// ConstructorAfterReturningAdvice.ts
//

import ClassType from "../class/ClassType.ts";
import Aspect from "./Aspect.ts";
import ConstructorAdvice from "./ConstructorAdvice.ts";

class ConstructorAfterReturningAdvice<T extends Aspect, C extends ClassType<object>> extends ConstructorAdvice<T, C> {

	public constructor(aspect: T) {
		super(aspect);
	}

	public override wrap(classType: C): C {
		const aspect: T = this.aspect;
		return class extends (classType as any) {

			public constructor(...args: any[]) {
				super(...args);
				aspect(this);
			}

		} as unknown as C;
	}

}

export default ConstructorAfterReturningAdvice;
