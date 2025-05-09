import { AsyncLocalStorage } from 'async_hooks';

export interface ContextMap {
    [key: string]: string;
}

/**
 * Mapped Diagnostic Context (MDC) implementation using `AsyncLocalStorage`.
 * MDC allows associating contextual information (key-value pairs) with the
 * current execution context, which can be useful for logging and tracing.
 *
 * Methods:
 * - `get(key: string)`: Retrieves the value associated with the given key in the current context.
 * - `put(key: string, value: string)`: Adds or updates a key-value pair in the current context.
 * - `putAll(context: ContextMap)`: Adds or updates multiple key-value pairs in the current context.
 * - `clear()`: Clears all key-value pairs in the current context.
 * - `runWithContext(context: ContextMap, callback: () => T)`: Runs a callback function with the provided context.
 */
export class MDC {
    private static storage = new AsyncLocalStorage<ContextMap>();

    /**
     * Retrieves the value associated with the given key in the current context.
     * 
     * @param key The key to retrieve the value for.
     * @returns The value associated with the key, or `undefined` if not found.
     */
    static get(key: string): string | undefined {
        const store = MDC.storage.getStore()!;
        return store ? store[key] : undefined;
    }

    /**
     * Adds or updates a key-value pair in the current context.
     * 
     * @param key The key to add or update.
     * @param value The value to associate with the key.
     */
    static put(key: string, value: string) {
        let store: ContextMap | undefined = MDC.storage.getStore();
        if (!store) {
            store = {};
        }
        store[key] = value;
        MDC.storage.enterWith(store);
    }

    /**
     * Adds or updates multiple key-value pairs in the current context.
     * 
     * @param context An object containing key-value pairs to add or update.
     */
    static putAll(context: ContextMap) {
        let store: ContextMap | undefined = MDC.storage.getStore();
        if (!store) {
            store = {};
        }
        Object.entries(context).forEach(([key, value]) => {
            store[key] = value;
        });
        MDC.storage.enterWith(context);
    }

    /**
     * Clears all key-value pairs in the current context.
     */
    static clear() {
        MDC.storage.enterWith({});
    }

    /**
     * Runs a callback function with the provided context.
     * 
     * @param context The context to associate with the callback execution.
     * @param callback The callback function to execute.
     * @returns The result of the callback function.
     */
    static runWithContext<T>(context: ContextMap, callback: () => T): T {
        return MDC.storage.run(context, callback);
    }
}
