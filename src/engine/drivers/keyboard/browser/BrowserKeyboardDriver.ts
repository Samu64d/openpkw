//
// BrowserKeyboardDriver.ts
//

import KeyboardDriver from "../../../core/interop/KeyboardDriver.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import Exception from "../../../core/exception/Exception.ts";
import BrowserWindow from "../../../platform/browser/BrowserWindow.ts";

@Disposable()
class BrowserKeyboardDriver extends KeyboardDriver implements Disposable.Target {

	private static readonly KEY_LIST: string[] = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "BracketRight", "Slash"];

	private readonly browserWindow: BrowserWindow;
	private readonly keyStateMap: Map<string, BrowserKeyboardDriver.KeyState>;

	public constructor() {
		super();

		this.browserWindow = BrowserWindow.FROM_GLOBAL_REFERENCE();
		this.keyStateMap = new Map<string, BrowserKeyboardDriver.KeyState>();
	}

	public override init(): void {
		this.populateKeyStateMap();
		this.registerWindowEventListeners();
	}

	public override isKeyPressed(key: string): boolean {
		const keyState: BrowserKeyboardDriver.KeyState = this.tryGetKeyState(key);

		return keyState.getPressState() == BrowserKeyboardDriver.KeyPressState.PRESSED;
	}

	public override isKeyReleased(key: string): boolean {
		const keyState: BrowserKeyboardDriver.KeyState = this.tryGetKeyState(key);

		return keyState.getPressState() == BrowserKeyboardDriver.KeyPressState.RELEASED;
	}

	public override getKeyPressTimestamp(key: string): number {
		const keyState: BrowserKeyboardDriver.KeyState = this.tryGetKeyState(key);

		return keyState.getPressTimestamp();
	}

	public override getKeyReleaseTimestamp(key: string): number {
		const keyState: BrowserKeyboardDriver.KeyState = this.tryGetKeyState(key);

		return keyState.getReleaseTimestamp();
	}

	public override getKeyPressDeltaTime(key: string): number {
		const keyPressTimestamp: number = this.getKeyPressTimestamp(key);

		if (this.isKeyPressed(key) == false || keyPressTimestamp == -1) {
			return -1;
		}

		return performance.now() - keyPressTimestamp;
	}

	public override dispose(): void {
	}

	private populateKeyStateMap(): void {
		for (const key of BrowserKeyboardDriver.KEY_LIST) {
			this.keyStateMap.set(key, new BrowserKeyboardDriver.KeyState());
		}
	}

	private onKeyDownListener(e: KeyboardEvent): void {
		const key: string = e.code;

		if (this.hasKey(key) == false || e.repeat == true) {
			return;
		}

		const keyState: BrowserKeyboardDriver.KeyState = this.keyStateMap.get(key) as BrowserKeyboardDriver.KeyState;

		keyState.setPressState(BrowserKeyboardDriver.KeyPressState.PRESSED);
		keyState.setPressTimestamp(performance.now());
	}

	private onKeyUpListener(e: KeyboardEvent): void {
		const key: string = e.code;

		if (this.hasKey(key) == false) {
			return;
		}

		const keyState: BrowserKeyboardDriver.KeyState = this.keyStateMap.get(key) as BrowserKeyboardDriver.KeyState;

		keyState.setPressState(BrowserKeyboardDriver.KeyPressState.RELEASED);
		keyState.setReleaseTimestamp(performance.now());
	}

	private onBlurListener(e: FocusEvent): void {
		for (const keyState of this.keyStateMap.values()) {
			keyState.setPressState(BrowserKeyboardDriver.KeyPressState.RELEASED);
			keyState.setReleaseTimestamp(performance.now());
		}
	}

	private registerWindowEventListeners(): void {
		this.browserWindow.registerEventListener("keydown", this.onKeyDownListener.bind(this));
		this.browserWindow.registerEventListener("keyup", this.onKeyUpListener.bind(this));
		this.browserWindow.registerEventListener("blur", this.onBlurListener.bind(this));
	}

	private hasKey(key: string): boolean {
		return this.keyStateMap.has(key);
	}

	private tryGetKeyState(key: string): BrowserKeyboardDriver.KeyState {
		if (this.hasKey(key) == false) {
			throw new Exception("Unknown keyboard key");
		}

		return this.keyStateMap.get(key) as BrowserKeyboardDriver.KeyState;
	}

}

namespace BrowserKeyboardDriver {

	export enum KeyPressState {
		RELEASED,
		PRESSED
	}

	export class KeyState {

		private pressState: KeyPressState;
		private pressTimestamp: number;
		private releaseTimestamp: number;

		public constructor() {
			this.pressState = KeyPressState.RELEASED;
			this.pressTimestamp = -1;
			this.releaseTimestamp = -1;
		}

		public getPressState(): KeyPressState {
			return this.pressState;
		}

		public setPressState(pressState: KeyPressState): void {
			this.pressState = pressState;
		}

		public getPressTimestamp(): number {
			return this.pressTimestamp;
		}

		public setPressTimestamp(pressTimestamp: number): void {
			this.pressTimestamp = pressTimestamp;
		}

		public getReleaseTimestamp(): number {
			return this.releaseTimestamp;
		}

		public setReleaseTimestamp(releaseTimestamp: number): void {
			this.releaseTimestamp = releaseTimestamp;
		}

	}

}

export default BrowserKeyboardDriver;
