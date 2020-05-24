/*
 * @Author: your name
 * @Date: 2020-05-23 15:25:02
 * @LastEditTime: 2020-05-23 15:25:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Test\promise_test.js
 */ 
// 1 创建一个新的Promise对象
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1000);
}).then(value => {
    console.log("任务1的结果", value);
    console.log("任务2开始");
    return 2;
}, reason => {
    console.log('任务1失败', reason);
}).then(
    value => {
        console.log('任务2的结果', value);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('任务3 异步');
                resolve(3)
            }, 1000);
        })
    },
).then(
    value => {
        console.log('任务3的结果', value);
    }
)
