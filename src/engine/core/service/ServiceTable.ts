// 
// ServiceTable.ts
//

import ClassType from "../reflection/class/ClassType.ts";
import Service from "./Service.ts";

//TODO: Stub
export default class ServiceTable {

	public static initialize(): void {

	}

	public static get<T extends Service>(classType: ClassType<T>): T {
		if (this.serviceMap.has(classType) == false) {
			throw new Error("Unknow service type.");
		}
		return this.serviceMap.get(classType) as T;
	}

	private static register<T extends Service>(classType: ClassType<T>): T {
		if (this.serviceMap.has(classType) == true) {
			throw new Error("Trying registring service multiple time.");
		}
		
		const instance: T = new classType();
		instance.init();
		this.serviceMap.set(classType, instance);
	}

	private static readonly serviceMap: Map<ClassType<Service>, Service> = new Map<ClassType<Service>, Service>();

}
