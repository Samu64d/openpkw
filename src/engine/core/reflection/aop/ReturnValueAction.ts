//
// ReturnValueAction.ts
//

export default interface ReturnValueAction<T extends object, R> {

	(this: T, value: R): R;

}
