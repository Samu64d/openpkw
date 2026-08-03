// 
// DriverAccessor.ts
//

import ClassType from "../reflection/class/ClassType.ts";
import Driver from "./Driver.ts";
import DriverRegistry from "./DriverRegistry.ts";

export default abstract class DriverAccessor<T extends Driver> {

	public readonly type: ClassType<T>;

	public constructor(type: ClassType<T>) {
		this.type = type;
	}

	public getDriver(): T {
		return DriverRegistry.get(this.type)
	}

}
