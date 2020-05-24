/*
 * @Author: your name
 * @Date: 2020-05-23 15:28:36
 * @LastEditTime: 2020-05-24 09:44:55
 * @LastEditors: Please set LastEditors
 * @Description: 自定义Promise模块 IFFE
 * @FilePath: \Test\lib\Promise.js
 */

(function (window) {
  const PENDING = "pending";
  const RESOLVED = "resolved";
  const REJECTED = "rejected";

  /**
   * Promise构造函数
   * executor: 执行器函数
   */
  function Promise(executor) {
    // 将this绑定到当前函数对象
    const _this = this;
    _this.status = PENDING; // 给Promise对象指定status属性，初始值为pending
    _this.data = undefined; // 给Promise对象指定一个用于存放结果数据的属性
    _this.callbacks = []; // 每个元素的结构 { onResolved() {}, onRejected() {}}

    // this.resolve = this.resolve.bind(this)
    // this.reject = this.reject.bind(this)

    function resolve(value) {
      // 如果当前状态不是pending，直接结束
      if (_this.status !== PENDING) {
        return;
      }
      // 将状态改为resolved
      _this.status = REJECTED;
      // 保存value数据
      _this.data = value;
      // 如果有待执行的回调函数，立即异步执行回调函数
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          // 放入宏队列中执行所有成功的回调(实际应该是放入微队列)
          _this.callbacks.forEach((callbacksObj) => {
            callbacksObj.onResolved(value);
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
   */
  Promise.prototype.then = function (onResolved, onRejected) {
    const _this = this;

    // 指定默认的成功的回调，传递value，保证安全
    onResolved =
      typeof onResolved === "function" ? onResolved : (value) => value;

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
            handle(onResolved);
          },
          onRejected(raason) {
            handle(onRejected);
          },
        });
      } else if (_this.status === RESOLVED) {
        // 回调函数要异步执行
        setTimeout(() => {
          handle(onResolved);
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

  /**
   * Promise函数对象的方法
   * resolve()：返回一个指定的成功的Promise
   * reject()：返回一个指定的失败的Promise
   * all()：返回一个Promise，只有当所有Promise都成功才返回成功，有一个失败就全部失败
   * race()：返回一个Promise，其结果由第一个完成的Promise来决定
   */

  Promise.resolve = function (value) {};

  Promise.reject = function (reason) {};

  Promise.all = function (promises) {};

  Promise.race = function (promises) {};
  /**
   * 对外暴露Promise函数
   */
  window.Promise = Promise;
})(window);