/*
 * @Author: your name
 * @Date: 2020-05-23 15:28:36
 * @LastEditTime: 2020-07-29 15:54:20
 * @LastEditors: Please set LastEditors
 * @Description: 自定义Promise模块 IFFE ES5
 * @FilePath: \Test\lib\Promise.js
 */

(function (window) {
  // 一个promise对象只能改变一次状态
  const PENDING = "pending";
  const FULFILLED = "fulfilled";
  const REJECTED = "rejected";

  /**
   * Promise构造函数
   * executor: 执行器函数
   */
  function Promise(executor) {
    // 将this绑定到当前函数对象
    const _this = this;
    // Promise实例对象内部的属性
    _this.status = PENDING; // 给Promise对象指定status属性，初始值为pending
    _this.data = undefined; // 给Promise对象指定一个用于存放结果数据的属性
    _this.callbacks = []; // 数组中每个元素的结构 { onFulfilled() {}, onRejected() {}}

    // this.resolve = this.resolve.bind(this)
    // this.reject = this.reject.bind(this)

    // 用于改变状态的回调函数
    function resolve(value) {
      // 如果当前状态不是pending，直接结束
      if (_this.status !== PENDING) {
        return;
      }
      // 将状态改为fulfilled
      _this.status = FULFILLED;
      // 保存value数据
      _this.data = value;
      // 如果有待执行的回调函数，立即异步执行onFulfilled 回调函数
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          // 放入宏队列中执行所有成功的回调(实际应该是放入微队列)
          // callbacks中保存的是包含两个回调函数的对象
          _this.callbacks.forEach((callbacksObj) => {
            callbacksObj.onFulfilled(value);
          });
        });
      }
    }

    function reject(reason) {
      // 如果当前状态不是pending，直接结束
      if (_this.status !== PENDING) {
        return;
      }
      // 将状态改为rejected
      _this.status = REJECTED;
      // 保存value数据
      _this.data = reason;
      // 如果有待执行的回调函数，立即异步执行回调函数
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          // 放入宏队列中执行所有失败的回调(实际应该是放入微队列)
          _this.callbacks.forEach((callbacksObj) => {
            callbacksObj.onRejected(reason);
          });
        });
      }
    }
    // 立即同步调用executor函数
    // 如果执行器抛出异常，Promise对象变为reject状态
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Promise原型对象的方法
   * then()：指定成功和失败的回调函数，返回一个新的Promise对象
   * catch()：指定失败的回调函数，返回一个新的Promise对象
   * finally(): 指定不管 Promise 对象最后状态如何，都会执行的操作
   */
  Promise.prototype.then = function (onFulfilled, onRejected) {
    const _this = this;

    // 指定默认的成功的回调，传递value，保证安全
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;

    // 实现异常穿透的必要条件，若then不传onRejected，要默认给定一个失败的回调
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 返回一个新的Promise对象
    return new Promise((resolve, reject) => {
      // 根据当前的状态，
      function handle(callback) {
        /**
         * 1. 执行抛出异常，返回的Promise就会失败
         * 2. 如果回调函数执行返回的不是Promise，那么return的Promise就会成功，value就是返回的值
         * 3. 如果回调函数执行返回的是Promise，那么return的Promise就会根据返回的Promise的结果来确定返回
         */
        try {
          const result = callback(_this.data);
          if (result instanceof Promise) {
            // result.then(): result也是Promise，只能使用then()获取Promise的结果
            // result.then(
            //   (value) => resolve(value), // 当result成功时，让return的Promise也成功
            //   (reason) => reject(reason) // 当result失败时，让return的Promise也失败
            // );
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }
      // 判断当前Pormise的状态
      if (_this.status === PENDING) {
        // Promise当前状态是pending，先将回调函数保存起来，异步执行onResolved并改变return的promise状态
        _this.callbacks.push({
          onResolved(value) {
            handle(onFulfilled);
          },
          onRejected(reason) {
            handle(onRejected);
          },
        });
      } else if (_this.status === RESOLVED) {
        // 回调函数要异步执行
        setTimeout(() => {
          handle(onFulfilled);
        });
      } else {
        // 回调函数要异步执行
        // then()中返回的Promise的成功失败跟调用then的Promise成功失败没有关系
        setTimeout(() => {
          handle(onRejected);
        });
      }
    });
  };

  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
  };

  // finally()方法
  Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
      value  => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    );
  };

  /**
   * Promise函数对象的方法
   * resolve()：返回一个指定的成功的Promise
   * reject()：返回一个指定的失败的Promise
   * all()：接收一个数组，返回一个Promise，只有当所有Promise都成功才返回成功，有一个失败就全部失败
   * race()：返回一个Promise，其结果由第一个完成的Promise来决定
   */

  Promise.resolve = function (value) {
    // 返回一个可能成功/失败的Promise
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  };

  Promise.reject = function (reason) {
    // 返回一个失败的Promise
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  };

  // Promise函数对象的all方法，接收Promise的数组
  Promise.all = function (promises) {
    const resolvedValues = new Array(promises.length);
    let resolvedCount = 0;
    return new Promise((resolve, reject) => {
      // 遍历promises获取每个Promise的结果
      promises.forEach((p, index) => {
        // 如果p不是Promise对象，就包装成Proimse
        Promise.resolve(p).then(
          // p成功，将成功的value保存
          (value) => {
            resolvedCount++;
            resolvedValues[index] = value;
            if (resolvedCount === promises.length) {
              resolve(resolvedValues);
            }
          },
          // 只要一个失败，return的promise就失败
          // 并且Promise的状态只能改变一次，如果第一次状态改变了，那么之后的调用就无效了，即便多次失败也只看第一次失败
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  };

  Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((p) => {
        // 如果p不是Promise对象，就包装成Proimse
        Promise.resolve(p).then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  };

  /**
   * 对外暴露Promise函数
   */
  window.Promise = Promise;
})(window);
