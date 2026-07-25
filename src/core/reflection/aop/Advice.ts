//
// Advice.ts
//

import Callable from "../../foundation/Callable.ts";
import Aspect from "./Aspect.ts";

export default abstract class Advice<T extends Aspect, M extends Callable> {

	protected readonly aspect: T;

	public constructor(aspect: T) {
		this.aspect = aspect;
	}

	public abstract wrap(target: M): M;

}
