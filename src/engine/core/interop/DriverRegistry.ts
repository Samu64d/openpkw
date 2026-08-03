//
// DriverRegistry.ts
//

import ClassType from "../reflection/class/ClassType.ts";
import Driver from "./Driver.ts";

export default class DriverRegistry {

	private static readonly driverMap: Map<ClassType<Driver>, Driver> = new Map<ClassType<Driver>, Driver>();

	public static has<T extends Driver>(type: ClassType<T>): boolean {
		return this.driverMap.has(type);
	}

	public static register<T extends Driver>(type: ClassType<T>, driver: T): void {
		this.driverMap.set(type, driver);
	}

	public static get<T extends Driver>(type: ClassType<T>): T {
		if (this.has(type) == false) {
			throw new Error("Trying get invalid registered driver.");
		}
		return this.driverMap.get(type) as T;
	}

}
