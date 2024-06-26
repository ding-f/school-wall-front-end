
function wxPromisify(fn) {
    return function (obj = {}) {
        return new Promise((resolve, reject) => {       //异步任务的实现方式，需要建立一个Promise 详见《菜鸟教程》JS基础教程
            obj.success = function (res) {      //res.data 服务器返回数据
                //成功
                wx.hideNavigationBarLoading()      //在当前页面隐藏导航条加载动画
                resolve(res)        //Promise 三种状态之一，传入Promise().then()，给接下来的函数执行，比如函数瀑布的逐步执行，逐步收入上次结果逐步输出不同结果
                
            }
            obj.fail = function (res) {
                //失败
                reject(res)          //Promise 三种状态之一
                wx.hideNavigationBarLoading()
                console.log(res)
            }
            fn(obj)
        })
    }
}
//无论promise对象最后状态如何都会执行
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
        let P = this.constructor;
        wx.hideNavigationBarLoading()
        return this.then(
            value => P.resolve(callback()).then(() => value),
            reason => P.resolve(callback()).then(() => { throw reason })
        );
    };
}
/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data,authJwt='') {
    // var authJwt=wx.getStorageSync('authorization');
    var httpInfo={
        url: url,
        method: 'GET',
        data: data,
        header: {
            'Content-Type': 'application/json',
            'Authorization':authJwt
        }
    };
    var getRequest = wxPromisify(wx.request);       //异步处理
    
    wx.showNavigationBarLoading();       //在当前页面显示导航条加载动画

    return getRequest(httpInfo);
}

/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data, authJwt='') {
  //其中会有3个重名“postRequest”，意思是： postRequest(url, data, authJwt='')将调用者对参数传递给return postRequest，它友回将数据传递给wx.request，最终将结果返回给被调用者。

  // wx.request({
  //   url: 'url',
  // })
    var postRequest = wxPromisify(wx.request);

  

    wx.showNavigationBarLoading();

    return postRequest({
        url: url,
        method: 'POST',
        data: data,
        header: {
            "content-type": "application/json",
            "Authorization": authJwt
        },
    })
}

function deleteRequest(url, data, authJwt=''){
  var deleteRequest = wxPromisify(wx.request);
  wx.showNavigationBarLoading();

  return deleteRequest({
    url: url,
    method: 'DELETE',
    data: data,
    header :{
      "content-type": "application/json",
      "Authorization": authJwt
    },
  })

}

module.exports = {
    postRequest: postRequest,
    getRequest: getRequest,
    deleteRequest: deleteRequest
}