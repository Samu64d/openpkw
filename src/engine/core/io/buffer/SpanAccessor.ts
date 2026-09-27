//
// SpanAccessor.ts
//

export default interface SpanAccessor<T> {

	get(position: number): T;

	set(position: number, value: T): void;

}
