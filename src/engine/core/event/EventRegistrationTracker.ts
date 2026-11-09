//
// EventRegistrationTracker.ts
//

import Record from "../reflection/decorators/Record.ts";
import EventListener from "./EventListener.ts"
import EventEmitter from "./EventEmitter.ts";

class EventRegistrationTracker<T extends object> {

	private readonly emitter: EventEmitter<T>;
	private readonly registrationList: Array<EventRegistrationTracker.Registration<keyof T, T[keyof T]>>;

	public constructor(emitter: EventEmitter<T>) {
		this.emitter = emitter;
		this.registrationList = new Array<EventRegistrationTracker.Registration<keyof T, T[keyof T]>>();
	}

	public add<K extends keyof T>(eventName: K, listener: EventListener<T[K]>): void {
		const registration: EventRegistrationTracker.Registration<keyof T, T[keyof T]> = new EventRegistrationTracker.Registration<keyof T, T[keyof T]>(eventName, listener as EventListener<T[keyof T]>);

		this.emitter.registerEventListener(eventName, listener);
		this.registrationList.push(registration);
	}

	public remove<K extends keyof T>(eventName: K, listener: EventListener<T[K]>): void {
		this.emitter.unregisterEventListener(eventName, listener);

		for (let i: number = 0; i < this.registrationList.length; i++) {
			const registration: EventRegistrationTracker.Registration<keyof T, T[keyof T]> = this.registrationList[i];

			if (registration.getEventName() == eventName && registration.getListener() == listener) {
				this.registrationList.splice(i, 1);
				break;
			}
		}
	}

	public removeAll(): void {
		for (const registration of this.registrationList.values()) {
			const eventName: keyof T = registration.getEventName();
			const listener: EventListener<T[keyof T]> = registration.getListener();

			this.emitter.unregisterEventListener(eventName, listener);
		}

		this.registrationList.splice(0, this.registrationList.length);
	}

}

namespace EventRegistrationTracker {

	@Record()
	export class Registration<T, K> {

		private readonly eventName: T;
		private readonly listener: EventListener<K>;

		public constructor(eventName: T, listener: EventListener<K>) {
			this.eventName = eventName;
			this.listener = listener;
		}

		public getEventName(): T {
			return this.eventName;
		}

		public getListener(): EventListener<K> {
			return this.listener;
		}

	}

}

export default EventRegistrationTracker;
