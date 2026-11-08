//
// ReturnValueAction.ts
//

import Action from "./Action.ts";

export default interface ReturnValueAction<T extends object, R> extends Action<T> {

	(this: T, value: R): R;

}
