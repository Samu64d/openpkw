//
// EventEmitter.ts
//

import EventListener from "./EventListener.ts";

export default interface EventEmitter<T extends object> {

	registerEventListener<K extends keyof T>(eventName: K, listener: EventListener<T[K]>): void;

	unregisterEventListener<K extends keyof T>(eventName: K, listener: EventListener<T[K]>): void;

}
