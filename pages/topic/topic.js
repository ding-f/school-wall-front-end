/*
 * 
 
 */
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');

var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js');
// const Adapter = require('../../utils/adapter.js')
var webSiteName= config.getWebsiteName;
var blog =config.getBlog;
var app = getApp();
Page({
    data: {
        text: "Page topic",
        categoriesList: [],
        floatDisplay: "none",
        openid:"",
        userInfo:{},
        webSiteName:webSiteName,
        blog:blog,

        // subimg: "subscription.png"        
    },


    onLoad: function (options) {
        Auth.setUserInfoData(this);     //检查是否有登录信息
        Auth.checkLogin(this);      //请求服务器验证Session是否过期
        wx.setNavigationBarTitle({
            title: '墙贴分类'
        });

        wx.showShareMenu({      //设置点击更多分享菜单
                  withShareTicket:true,
                  menus:['shareAppMessage','shareTimeline'],
                  success:function(e)
                  {
                    //console.log(e);
                  }
            })
        // Adapter.setInterstitialAd("enable_topic_interstitial_ad");
        this.fetchCategoriesData();
        
    },

    onShow:function(){            
      this.getTabBar().init();

      var self=this;

      Auth.checkLogin(self);    //检查Code是否过期
      Auth.setUserInfoData(self); //为整个页面，setdata用户信息

      self.fetchCategoriesData();
    },

    onPullDownRefresh: function(){
      var self = this;
      
      self.fetchCategoriesData();

    },
    // mark: 获取分类列表方法
    fetchCategoriesData: function () {
        var self = this;        
        self.setData({
            categoriesList: []
        });
        //console.log(Api.getCategories());
        // https://www.watch-life.net/wp-json/watch-life-net/v1/category/ids

       
        // var getCategoriesIdsRequest = wxRequest.getRequest(Api.getCategoriesIds());     //请求获取分类列表API
        // getCategoriesIdsRequest.then(res=>{
            

            // var ids="";     //订阅功能的参数，根据ID点亮订阅按钮

            var openid= self.data.openid;   //如果有说明已经登录小程序

        //     if(!res.data.Ids=="")
        //     {
        //         ids=res.data.Ids;
        //     }
            var authJwt = wx.getStorageSync('authorization');
            var getCategoriesRequest = wxRequest.getRequest(Api.getCategories(openid),'',authJwt);
                getCategoriesRequest.then(response => {
                    // console.log(response)
                    if (response.statusCode === 200) {
                        self.setData({
                            floatDisplay: "block",
                            categoriesList: self.data.categoriesList.concat(response.data.data.map(function (item) {
                                if (item.categoryThumbnailImage == "") {
                                    item.categoryThumbnailImage = "../../images/error.jpg";
                                
                                }
                                // if(item.subTab=1){
                                //   item.subimg="subscription-on.png";
                                // }else{
                                //   item.subimg="subscription.png";
                                // }

                                return item;
                            })),
                        });
                        // console.log(self.data.categoriesList)
                    }
                    else {
                        console.log(response);
                    }

                    })
                    // .then(res=>{
                    //     if (self.data.openid) {                
                    //         setTimeout(function () {
                    //             self.getSubscription();
                    //         }, 500);  
                    //     }
                        
                    // })
                    .catch(function (response) {
                        console.log(response);

                    }).finally(function () {

                    })
        // })
        
    },

    onShareAppMessage: function () {
        return {
            title: '分享“' + config.getWebsiteName + '”的专题栏目.',
            path: 'pages/topic/topic',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    // 自定义分享朋友圈
   onShareTimeline: function() {
    return {
      title:  '“' + config.getWebsiteName + '”的专题栏目',
      path: 'pages/topic/topic' ,
      
    }
  },    

  // mark: 点击了订阅按钮
    postsub: function (e) {
        var self = this;
        if (!self.data.openid) {
          //呼出登录对话框
            Auth.checkSession(self,'isLoginNow'); 
        }
        else {
            var categoryid = e.currentTarget.dataset.id;
            var openid = self.data.openid;
            var url = Api.postSubscription();
            var subflag = e.currentTarget.dataset.subflag;  //已订阅标识
            var data = {
                categoryId: categoryid,
                openId: openid,
                subTab:subflag
            };

            var authJwt = wx.getStorageSync('authorization');
            var postSubscriptionRequest = wxRequest.postRequest(url, data,authJwt);
            postSubscriptionRequest.then(response => {
              
                if (response.data.code === 200) {
                  //触发订阅
                    if (response.data.msg == 'subed') {
                        setTimeout(function () {
                            wx.showToast({
                                title: '订阅成功',
                                icon: 'success',
                                duration: 900,
                                success: function () {

                                }
                            });
                        }, 900);
                        // var subimg = "";
                        if (subflag == "0") {
                            subflag = "1";
                            // subimg = "subscription-on.png"
                        }
                        else {
                            subflag = "0";
                            // subimg = "subscription.png"
                        }
                        self.reloadData(categoryid, subflag);

                    }
                    //触发取消订阅
                    else if (response.data.msg == 'unsub') {
                        setTimeout(function () {
                            wx.showToast({
                                title: '取消订阅成功',
                                icon: 'success',
                                duration: 900,
                                success: function () {
                                }
                            });
                        }, 900);
                        // var subimg = "";
                        if (subflag == "1") {
                            subflag = "0";
                            // subimg = "subscription-on.png"
                        }
                        else {
                            subflag = "1";
                            // subimg = "subscription.png"
                        }
                        self.reloadData(categoryid, subflag);

                    }
                    else if (response.data.status == '501' || response.data.status == '501') {
                        console.log(response);
                    }


                }
                else {
                    setTimeout(function () {
                        wx.showToast({
                            title: '操作失败,请稍后重试',
                            icon: 'success',
                            duration: 900,
                            success: function () {

                            }
                        });
                    }, 900);
                    console.log(response);
                }

            }).catch(function (response) {
                setTimeout(function () {
                    wx.showToast({
                        title: '操作失败,请稍后重试',
                        icon: 'success',
                        duration: 900,
                        success: function () {
                        }
                    });
                }, 900);
                console.log(response);
            })
        }
    },

    // mark: 订阅列表重载
    reloadData: function (id, subTab) {
        var self = this;
        var newCategoriesList = [];
        var categoriesList = self.data.categoriesList;
        for (var i = 0; i < categoriesList.length; i++) {
            if (categoriesList[i].id == id) {
                categoriesList[i].subflag = subTab;
                
            }
            newCategoriesList.push(categoriesList[i]);
        }

        if (newCategoriesList.length > 0) {
            self.setData({
                categoriesList: newCategoriesList
            });
            self.onPullDownRefresh();

        }

    },

    // mark: 跳转至某分类下的帖子列表
    redictIndex: function (e) {
        //console.log('查看某类别下的帖子');  
        var id = e.currentTarget.dataset.id;
        // var name = e.currentTarget.dataset.item;
        var url = '../list/list?categoryID=' + id;
        wx.navigateTo({
            url: url
        });
    },
    userAuthorization: function () {
        var self = this;
        // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
        wx.getSetting({
            success: function success(res) {
                console.log(res.authSetting);
                var authSetting = res.authSetting;
                if (!('scope.userInfo' in authSetting)) {
                //if (util.isEmptyObject(authSetting)) {
                    console.log('第一次授权');
                    self.setData({ isLoginPopup: true })

                } else {
                    console.log('不是第一次授权', authSetting);
                    // 没有授权的提醒
                    if (authSetting['scope.userInfo'] === false) {
                        wx.showModal({
                            title: '用户未授权',
                            content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
                            showCancel: true,
                            cancelColor: '#296fd0',
                            confirmColor: '#296fd0',
                            confirmText: '设置权限',
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                    wx.openSetting({
                                        success: function success(res) {
                                            console.log('打开设置', res.authSetting);
                                            var scopeUserInfo = res.authSetting["scope.userInfo"];
                                            if (scopeUserInfo) {
                                                self.getUsreInfo(null);
                                            }
                                        }
                                    });
                                }
                            }
                        })
                    }
                    else {
                        auth.getUsreInfo(null);
                    }
                }
            }
        });
    },
    //登录对话框点击同意登录
    agreeGetUser: function (e) {        
        let self= this;
        Auth.checkAgreeGetUser(e,app,self,'0');   

        setTimeout(function () {
            self.fetchCategoriesData();             
        }, 1000);
        
    },
    closeLoginPopup() {
        this.setData({ isLoginPopup: false });
    },
    openLoginPopup() {
        this.setData({ isLoginPopup: true });
    },
    getOpenId(data) {
        var url = Api.getOpenidUrl();
        var self  = this;
        var postOpenidRequest = wxRequest.postRequest(url, data);
        //获取openid
        postOpenidRequest.then(response => {
            if (response.data.status == '200') {
                //console.log(response.data.openid)
                console.log("openid 获取成功");
                app.globalData.openid = response.data.openid;
                app.globalData.isGetOpenid = true;

            }
            else {
                console.log(response);
            }
        }).then(res=>{
            setTimeout(function () {
                self.getSubscription();               
            }, 500);
        })
    },
    confirm: function () {
        this.setData({
            'dialog.hidden': true,
            'dialog.title': '',
            'dialog.content': ''
        })
    } 

})