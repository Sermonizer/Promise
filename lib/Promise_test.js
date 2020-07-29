/*
 * @Author: your name
 * @Date: 2020-07-10 10:17:16
 * @LastEditTime: 2020-07-10 10:52:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Promise\lib\Promise_test.js
 */

(function (window) {
  const PENDING = "pending";
  const FULFILLED = "fulfilled";
  const REJECTED = "rejected";

  function Promise(executor) {
    let _this = this;
    _this.status = PENDING;
    _this.data = "";
    _this.callbacks = [];

    function resolve(value) {
      if (_this.status !== PENDING) {
        return;
      }
      _this.status = FULFILLED;
      _this.data = value;
      // 但是 有可能回调队列中还有没执行的promise，因此要放到定时任务
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          _this.callbacks.forEach((obj) => {
            obj.onFulfilled(value);
          });
        });
      }
    }

    function reject(reason) {
      if (_this.status !== PENDING) {
        return;
      }
      _this.status = REJECTED;
      _this.data = reason;
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          _this.callbacks.forEach((obj) => {
            obj.onRejected(reason);
          });
        });
      }
    }
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  Promise.prototype.then = (onFulfilled, onRejected) => {
    const _this = this;
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
              };
      return new Promise((resolve, reject) => {
        
    })
  };
})(window);
