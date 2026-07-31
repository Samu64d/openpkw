//
// ClassAdviceApplier.ts
//

import Callable from "../../common/Callable.ts";
import ClassType from "../class/ClassType.ts";
import Aspect from "./Aspect.ts";
import Advice from "./Advice.ts";

export default class ClassAdviceApplier<T extends object> {

	private readonly target: ClassType<T>;

	public constructor(target: ClassType<T>) {
		this.target = target;
	}

	public getTarget(): ClassType<T> {
		return this.target;
	}

	public applyToMethod<K extends ClassType.MethodName<T>, A extends Aspect, M extends ClassType.Method<T, K> & Callable>(methodName: K, advice: Advice<A, M>): void {
		const method: M = ClassType.getMethod(this.target, methodName) as M;
		const wrappedMethod: M = advice.wrap(method);
		ClassType.setMethod(this.target, methodName, wrappedMethod);
	}

	public applyToAllMethods<A extends Aspect>(advice: Advice<A, any>): void {
		const methodNameList: ClassType.MethodName<T>[] = ClassType.getMethodNameList(this.target);
		for (const methodName of methodNameList) {
			this.applyToMethod(methodName, advice);
		}
	}

}
