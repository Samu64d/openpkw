//
// KeyboardDriver.ts
//

import Driver from "./Driver.ts";

export default abstract class KeyboardDriver implements Driver {

	public abstract init(): void;

	public abstract isKeyPressed(key: string): boolean;

	public abstract isKeyReleased(key: string): boolean;

	public abstract getKeyPressTimestamp(key: string): number;

	public abstract getKeyReleaseTimestamp(key: string): number;

	public abstract getKeyPressDeltaTime(key: string): number;

	public abstract dispose(): void;

}
