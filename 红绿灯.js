/*
 * @Author: your name
 * @Date: 2020-08-07 21:10:11
 * @LastEditTime: 2020-08-07 21:35:06
 * @LastEditors: Please set LastEditors
 * @Description: 红灯3秒亮一次，绿灯1秒亮一次，黄灯2秒亮一次；
 *               如何让三个灯不断交替重复亮灯？（用 Promise 实现）
 * @FilePath: \Promise\红绿灯.js
 */
function red(){
    console.log((new Date()).getSeconds() - now.getSeconds(), 'red');
}
function green(){
    console.log((new Date()).getSeconds() - now.getSeconds(), 'green');
}
function yellow(){
    console.log((new Date()).getSeconds() - now.getSeconds(), 'yellow');
}

let now = new Date()

var light = function(timmer, cb){
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            cb();
            resolve();
        }, timmer);
    });
};

var step = function() {
    Promise.resolve().then(function(){
        return light(1000, green);
    }).then(function(){
        return light(2000, yellow);
    }).then(function(){
        return light(3000, red);
    }).then(function(){
        step();
    });
}

step();