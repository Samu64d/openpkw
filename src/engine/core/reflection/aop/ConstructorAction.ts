//
// ConstructorAction.ts
//

export default interface ConstructorAction<T extends object> {

	(this: T): void;

}
