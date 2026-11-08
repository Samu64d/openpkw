//
// EventListener.ts
//

export default interface EventListener<T> {

	(event: T, ...args: any[]): void;

}
