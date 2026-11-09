//
// AroundAction.ts
//

export default interface AroundAction<T extends object> {

	(this: T, proceed: (...args: any[]) => any, ...args: any[]): any;

}
