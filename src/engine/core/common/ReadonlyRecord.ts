//
// ReadonlyRecord.ts
//

type ReadonlyRecord<T extends PropertyKey, R> = Readonly<Record<T, R>>;

export default ReadonlyRecord;
