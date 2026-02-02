export class ObjectPool<T> {
    private _pool: T[] = [];
    private _createFactory: () => T;
    private _resetFn: (item: T) => void;

    constructor(createFactory: () => T, resetFn: (item: T) => void, initialSize: number = 0) {
        this._createFactory = createFactory;
        this._resetFn = resetFn;

        for (let i = 0; i < initialSize; i++) {
            this._pool.push(this._createFactory());
        }
    }

    public get(): T {
        if (this._pool.length > 0) {
            const item = this._pool.pop()!;
            this._resetFn(item);
            return item;
        } else {
            return this._createFactory();
        }
    }

    public return(item: T): void {
        this._pool.push(item);
    }
}
