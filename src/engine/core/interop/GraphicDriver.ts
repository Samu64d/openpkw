//
// GraphicDriver.ts
//

import Driver from "./Driver.ts";

export default abstract class GraphicDriver implements Driver {

	public abstract init(): void;

	public abstract dispose(): void;

}
