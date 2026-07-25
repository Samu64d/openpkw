// 
// DataAccessor.ts
//

export default interface DataAccessor<T, V> {

	getAt(locator: T): V;

	setAt(locator: T, value: V): void;

}
