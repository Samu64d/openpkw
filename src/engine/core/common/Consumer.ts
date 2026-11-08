//
// Consumer.ts
//

export default interface Consumer<T> {

	(value: T): void;

}
