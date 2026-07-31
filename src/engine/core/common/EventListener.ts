//
// EventListener.ts
//

type EventListener<T> = (event: T, ...args: any[]) => any;

export default EventListener;
