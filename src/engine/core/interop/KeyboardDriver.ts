//
// KeyboardDriver.ts
//

import Driver from "./Driver.ts";

export default abstract class KeyboardDriver implements Driver {

	public abstract init(): void;

	public abstract dispose(): void;

}
