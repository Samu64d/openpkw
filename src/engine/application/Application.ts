//
// Application.ts
//

export default abstract class Application {

	public static getContentsTemplate(): string {
		return "";
	}

	public abstract isReady(): boolean;

	public abstract onReady(): void;

	public abstract getClientWidth(): number;

	public abstract getClientHeight(): number;

	public abstract onClientResize(width: number, height: number): void;

	public abstract hasErrors(): boolean;

	public abstract onError(e: unknown): void;

}
