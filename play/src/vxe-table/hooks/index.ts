/**
 * 将 promise 转化为延迟调用，以便控制其流程
 */
export function useDefer<T = unknown>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  const states = Object.freeze({
    promise,
    then: promise.then.bind(promise),
    resolve: resolve!,
    reject: reject!,
  });

  return states;
}
