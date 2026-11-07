//
// BrowserKeyboardDriver.ts
//

import EventRegistrationTracker from "../../../core/event/EventRegistrationTracker.ts";
import KeyboardDriver from "../../../core/interop/KeyboardDriver.ts";
import Disposable from "../../../core/reflection/decorators/Disposable.ts";
import Exception from "../../../core/exception/Exception.ts";
import BrowserWindow from "../../../platform/browser/BrowserWindow.ts";

@Disposable()
class BrowserKeyboardDriver extends KeyboardDriver implements Disposable.Target {

	private static readonly KEY_LIST: string[] = ["KeyP", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "BracketRight", "Slash"];

	private readonly browserWindow: BrowserWindow;
	private readonly eventTracker: EventRegistrationTracker<keyof WindowEventMap, WindowEventMap[keyof WindowEventMap]>;
	private readonly keyStatsMap: Map<string, BrowserKeyboardDriver.KeyStats>;

	public constructor() {
		super();

		this.browserWindow = BrowserWindow.FROM_GLOBAL_REFERENCE();
		this.eventTracker = new EventRegistrationTracker(this.browserWindow);
		this.keyStatsMap = new Map<string, BrowserKeyboardDriver.KeyStats>();
	}

	public override init(): void {
		this.populateKeyStatsMap();
		this.registerWindowEventListeners();
	}

	public override isKeyPressed(key: string): boolean {
		const keyStats: BrowserKeyboardDriver.KeyStats = this.tryGetKeyStats(key);

		return keyStats.getState() == BrowserKeyboardDriver.KeyState.PRESSED;
	}

	public override isKeyReleased(key: string): boolean {
		const keyStats: BrowserKeyboardDriver.KeyStats = this.tryGetKeyStats(key);

		return keyStats.getState() == BrowserKeyboardDriver.KeyState.RELEASED;
	}

	public override getLastKeyPressTimestamp(key: string): number {
		const keyStats: BrowserKeyboardDriver.KeyStats = this.tryGetKeyStats(key);

		return keyStats.getLastPressTime();
	}

	public override getLastKeyReleaseTimestamp(key: string): number {
		const keyStats: BrowserKeyboardDriver.KeyStats = this.tryGetKeyStats(key);

		return keyStats.getLastReleaseTime();
	}

	public override getKeyPressDeltaTime(key: string): number {
		const keyStats: BrowserKeyboardDriver.KeyStats = this.tryGetKeyStats(key);

		if (this.isKeyPressed(key) == false || keyStats.getLastReleaseTime() == -1) {
			return -1;
		}

		return performance.now() - keyStats.getLastReleaseTime();
	}

	public override dispose(): void {
		this.eventTracker.removeAll();
	}

	private populateKeyStatsMap(): void {
		for (const key of BrowserKeyboardDriver.KEY_LIST) {
			this.keyStatsMap.set(key, new BrowserKeyboardDriver.KeyStats());
		}
	}

	private onKeyDownListener(e: KeyboardEvent): void {
		const key: string = e.code;

		if (this.hasKey(key) == false || e.repeat == true) {
			return;
		}

		const keyStats: BrowserKeyboardDriver.KeyStats = this.keyStatsMap.get(key) as BrowserKeyboardDriver.KeyStats;

		keyStats.setState(BrowserKeyboardDriver.KeyState.PRESSED);
		keyStats.setLastPressTime(performance.now());
	}

	private onKeyUpListener(e: KeyboardEvent): void {
		const key: string = e.code;

		if (this.hasKey(key) == false) {
			return;
		}

		const keyStats: BrowserKeyboardDriver.KeyStats = this.keyStatsMap.get(key) as BrowserKeyboardDriver.KeyStats;

		keyStats.setState(BrowserKeyboardDriver.KeyState.RELEASED);
		keyStats.setLastReleaseTime(performance.now());
	}

	private onBlurListener(): void {
		for (const keyStats of this.keyStatsMap.values()) {
			keyStats.setState(BrowserKeyboardDriver.KeyState.RELEASED);
			keyStats.setLastReleaseTime(performance.now());
		}
	}

	private registerWindowEventListeners(): void {
		this.eventTracker.add("keydown", this.onKeyDownListener.bind(this));
		this.eventTracker.add("keyup", this.onKeyUpListener.bind(this));
		this.eventTracker.add("blur", this.onBlurListener.bind(this));
	}

	private hasKey(key: string): boolean {
		return this.keyStatsMap.has(key);
	}

	private tryGetKeyStats(key: string): BrowserKeyboardDriver.KeyStats {
		if (this.hasKey(key) == false) {
			throw new Exception("Unknown keyboard key");
		}

		return this.keyStatsMap.get(key) as BrowserKeyboardDriver.KeyStats;
	}

}

namespace BrowserKeyboardDriver {

	export enum KeyState {
		RELEASED,
		PRESSED
	}

	export class KeyStats {

		private state: KeyState;
		private lastPressTime: number;
		private lastReleaseTime: number;

		public constructor() {
			this.state = KeyState.RELEASED;
			this.lastPressTime = -1;
			this.lastReleaseTime = -1;
		}

		public getState(): KeyState {
			return this.state;
		}

		public setState(state: KeyState): void {
			this.state = state;
		}

		public getLastPressTime(): number {
			return this.lastPressTime;
		}

		public setLastPressTime(lastPressTime: number): void {
			this.lastPressTime = lastPressTime;
		}

		public getLastReleaseTime(): number {
			return this.lastReleaseTime;
		}

		public setLastReleaseTime(lastReleaseTime: number): void {
			this.lastReleaseTime = lastReleaseTime;
		}

	}

}

export default BrowserKeyboardDriver;
