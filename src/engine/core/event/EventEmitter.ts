//
// EventEmitter.ts
//

import EventListener from "./EventListener.ts";

export default interface EventEmitter<T, K> {

	registerEventListener(eventName: T, listener: EventListener<K>): void;

	unregisterEventListener(eventName: T, listener: EventListener<K>): void;

}
