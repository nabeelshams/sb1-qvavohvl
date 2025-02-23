// Utils.ts

let proxyIndex = 0;
let proxyList: string[] = [];

export const retry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, 1000)); // wait 1 second before retry
            return retry(fn, retries - 1);
        }
        throw error;
    }
};

export const setProxyList = (proxies: string[]): void => {
    proxyList = proxies;
};

export const getNextProxy = (): string | null => {
    if (proxyList.length === 0) return null;
    const proxy = proxyList[proxyIndex];
    proxyIndex = (proxyIndex + 1) % proxyList.length;
    return proxy;
};
