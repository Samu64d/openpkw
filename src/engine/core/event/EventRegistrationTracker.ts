//
// EventRegistrationTracker.ts
//

import EventListener from "./EventListener.ts"
import EventEmitter from "./EventEmitter.ts";
import Record from "../reflection/decorators/Record.ts";

class EventRegistrationTracker<T, K> {

	private readonly emitter: EventEmitter<any, any>;
	private readonly registrationList: Array<EventRegistrationTracker.Registration>;

	public constructor(emitter: EventEmitter<T, K>) {
		this.emitter = emitter;
		this.registrationList = new Array<EventRegistrationTracker.Registration>();
	}

	public add<T, K>(eventName: T, listener: EventListener<K>): void {
		this.emitter.registerEventListener(eventName, listener);
		this.registrationList.push(new EventRegistrationTracker.Registration(eventName, listener));
	}

	public remove(eventName: T, listener: EventListener<K>): void {
		this.emitter.unregisterEventListener(eventName, listener);

		for (let i: number = 0; i < this.registrationList.length; i++) {
			const registration: EventRegistrationTracker.Registration = this.registrationList[i];

			if (registration.getEventName() == eventName && registration.getListener() == listener) {
				this.registrationList.splice(i, 1);
				break;
			}
		}
	}

	public removeAll(): void {
		for (const registration of this.registrationList.values()) {
			const eventName: unknown = registration.getEventName();
			const listener: EventListener<unknown> = registration.getListener();

			this.emitter.unregisterEventListener(eventName, listener);
		}

		this.registrationList.splice(0, this.registrationList.length);
	}

}

namespace EventRegistrationTracker {

	@Record()
	export class Registration {

		private readonly eventName: unknown;
		private readonly listener: EventListener<unknown>;

		public constructor(eventName: unknown, listener: EventListener<unknown>) {
			this.eventName = eventName;
			this.listener = listener;
		}

		public getEventName(): unknown {
			return this.eventName;
		}

		public getListener(): EventListener<unknown> {
			return this.listener;
		}

	}

}

export default EventRegistrationTracker;
