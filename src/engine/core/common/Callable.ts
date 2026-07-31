//
// Callable.ts
//

type Callable = (...args: any[]) => any | (new (...args: any[]) => any);

export default Callable;
