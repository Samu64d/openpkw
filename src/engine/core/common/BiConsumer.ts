//
// BiConsumer.ts
//

export default interface BiConsumer<T, U> {

	(value1: T, value2: U): void;

}
