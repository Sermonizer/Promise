/*
 * @Author: your name
 * @Date: 2020-07-10 10:17:16
 * @LastEditTime: 2020-07-29 16:36:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Promise\lib\Promise_test.js
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class Promise {
  constructor(excutor) {
    const _this = this;
    _this.status = PENDING;
    _this.data = undefined;
    _this.callbacks = [];

    function resolve(value) {
      if (_this.status !== PENDING) {
        return;
      }
      _this.status = FULFILLED;
      _this.data = value;
      if (_this.callbacks.length > 0) {
        setTimeout(() => {
          _this.callbacks.forEach((callbackObj) => {
            callbackObj.onFulfilled(value);
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
        _this.callbacks.forEach((callbackObj) => {
          callbackObj.onRejected(reason);
        });
      }
    }

    try {
      excutor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then = function (onFulfilled, onRejected) {
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
      function handle(callback) {
        try {
          const result = callback(_this.data)
          if (result instanceof Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
      }

      if (_this.status === PENDING) {
        _this.callbacks.push({
          onFulfilled(value) {
            handle(onFulfilled)
          },
          onRejected(reason) {
            handle(onRejected)
          }
        })
      } else if (_this.status === FULFILLED) {
        setTimeout(() => {
          handle(onFulfilled) 
        });
      } else {
        setTimeout(() => {
          handle(onRejected) 
        });
      }
    })
  };


}
