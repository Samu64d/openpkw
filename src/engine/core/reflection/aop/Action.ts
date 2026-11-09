//
// Action.ts
//

export default interface Action<T extends object> {

	(this: T, ...args: any[]): void;

}
