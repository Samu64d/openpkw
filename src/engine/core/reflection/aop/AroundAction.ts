//
// AroundAction.ts
//

import Action from "./Action.ts";

export default interface AroundAction<T extends object> extends Action<T> {

	(this: T, proceed: boolean, ...args: any[]): any;

}
