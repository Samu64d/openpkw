//
// ClassAspects.ts
//

import ClassType from "../class/ClassType.ts";
import Advice from "./Advice.ts";

export default class ClassAspects<T extends object> {

	private readonly target: ClassType<T>;

	public constructor(target: ClassType<T>) {
		this.target = target;
	}

	public getTarget(): ClassType<T> {
		return this.target;
	}

	public applyToMethod<K extends ClassType.MethodName<T>, M extends ClassType.Method<T, K>, A extends Advice<T, M>>(methodName: K, advice: A): void {
		const method: M = ClassType.getMethod(this.target, methodName) as M;
		const wrappedMethod: M = advice.wrap(method);

		ClassType.setMethod(this.target, methodName, wrappedMethod);
	}

	public applyToAllMethods(advice: Advice<T, any>): void {
		const methodNameList: ClassType.MethodName<T>[] = ClassType.getMethodNameList(this.target);

		for (const methodName of methodNameList) {
			this.applyToMethod(methodName, advice);
		}
	}

}
