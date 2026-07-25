//
// Handler.ts
//

type Handler<T> = (event: T, ...args: any[]) => any;

export default Handler;
