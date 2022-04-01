


import config from '../../utils/config.js'
// var Api = require('../../utils/api.js');
// var util = require('../../utils/util.js');
// var auth = require('../../utils/auth.js');

// var wxApi = require('../../utils/wxApi.js');
// var wxRequest = require('../../utils/wxRequest.js');


Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: null,
        title: "",

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        //console.log(decodeURIComponent(options.url));
        console.log(options);
        if (options.url != null) {      //传进来的网页链接
            var url = decodeURIComponent(options.url);  //编码的URI进行解码（正常化）
            if (url.indexOf('*') != -1) {
                url = url.replace("*", "?");        //
            }
            self.setData({
                url: url
            });
           
        }
        else {  //如果传进来的URI=null ，直接转向我的博客
            self.setData({
                url: 'https://' + config.getBlog
            });
        }

    },


    //分享打开的网页
    onShareAppMessage: function (options) {
        var self = this;
        var url = options.webViewUrl;   //options.webViewUrl，赋值一遍作用不明，不知道options.url和options.webViewUrl之间的区别
        if(url.indexOf("mp.weixin.qq.com") !=-1)        //如果是微信公众平台
        {
            url=self.data.url;
        }
        if (url.indexOf("?") != -1) {
            url = url.replace("?", "*");        //替换成*才能被本网页加载页面正确执行
        }
        url = 'pages/webpage/webpage?url=' + url;
        console.log(url);
        return {
            title: '分享"' + config.getWebsiteName + '"的帖子' + self.data.title,
            path: url,
            success: function (res) {
                // 转发成功
                console.log(url);
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
})