//
// ClassType.ts
//

import Nullable from "../../foundation/Nullable.ts";
import Callable from "../../foundation/Callable.ts";

type ClassType<T extends object> = abstract new (...args: any[]) => T;

namespace ClassType {

	export type MethodName<T extends object> = {
		[K in keyof T]: T[K] extends Callable ? K : never;
	}[keyof T];

	export type Method<T extends object, K extends MethodName<T>> = T[K];

	export const CONSTRUCTOR_NAME: string = "constructor";

	export function hasMethod<T extends object>(classType: ClassType<T>, methodName: MethodName<T>): boolean {
		return typeof classType.prototype[methodName] == "function";
	}

	export function getMethod<T extends object, K extends MethodName<T>>(classType: ClassType<T>, methodName: K): Method<T, K> {
		const prototype: T = classType.prototype;
		const method: T[K] = prototype[methodName];
		if (typeof method != "function") {
			throw new Error("Method not found.");
		}
		return method as Method<T, K>;
	}

	export function setMethod<T extends object, K extends MethodName<T>>(classType: ClassType<T>, methodName: K, method: Method<T, K>): void {
		classType.prototype[methodName] = method;
	}

	export function getMethodNameList<T extends object>(classType: ClassType<T>): MethodName<T>[] {
		const methodNameSet: Set<MethodName<T>> = new Set<MethodName<T>>();
		let prototype: Nullable<object> = classType.prototype;

		while (prototype != null && prototype != Object.prototype) {
			const propertyNameList: string[] = Object.getOwnPropertyNames(prototype);
			for (const key of propertyNameList) {
				if (key != ClassType.CONSTRUCTOR_NAME) {
					const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(prototype, key);
					if (descriptor != undefined && typeof descriptor.value == "function") {
						methodNameSet.add(key as MethodName<T>);
					}
				}
			}
			prototype = Object.getPrototypeOf(prototype);
		}

		return Array.from(methodNameSet);
	}

}

export default ClassType;
