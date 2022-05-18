var util = require('util.js');
var wxApi = require('wxApi.js')
var wxRequest = require('wxRequest.js')
var Api = require('api.js');
var app = getApp();

const Auth = {}

// mark: 检测当前用户是否已登录，失效登录弹出请求登录对话框 （需登录项加载）
Auth.checkSession = function (appPage, flag) {
  let openid = wx.getStorageSync('openid');
  if (!openid) {
    if ('isLoginNow' == flag) { //作用是呼出登录对话框，点击登录调用本地函数checkAgreeGetUser
      var userInfo = {
        avatarUrl: "../../images/gravatar.png",
        nickName: "登录",
        isLogin: false
      }
      appPage.setData({
        isLoginPopup: true,
        userInfo: userInfo
      });
    }

  }
}

// mark: 请求服务器，检查Session是否过期（需要登录权限页面的 onLoad 加载）【准备实现Shiro Session验证是否失效，如果失效重传JWT】
Auth.checkLogin = function (appPage) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  // wx.checkSession 接口检测当前用户登录态是否有效（微信官方）
  wx.checkSession({
    success: function () { //微信服务器的session_key未失效
      if (!wxLoginInfo.js_code) //有可能被用户清楚了缓存
      {
        //查证UUID是否过期（过期重传Jwt）
        //wxLogin()封装了wx.login()
        Auth.wxLogin().then(res => {
          appPage.setData({
            wxLoginInfo: res
          });
          wx.setStorageSync('wxLoginInfo', res);
          console.log('checkSession_success_wxLogins');
        })
      }
    },
    fail: function () { //类似于：于查证Jwt是否过期（过期签证Jwt）
      Auth.logout(appPage); //清除所有旧的用户信息
      // wx.reLaunch({
      //     url: '../index/index'
      //   });
      Auth.wxLogin().then(res => { //微信服务器的session_key失效(官方：说需重新登录小程序)

        appPage.setData({
          wxLoginInfo: res
        });
        wx.setStorageSync('wxLoginInfo', res);
        console.log('checkSession_fail_wxLoginfo');
      });

    }
  })
}


// mark: 点击同意登录【未过期就不进行JWT签证】
Auth.checkAgreeGetUser = function (e, app, appPage, authFlag) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo'); //Code
  if (wxLoginInfo.js_code) {
    Auth.agreeGetUser(e, wxLoginInfo, authFlag).then(res => {
      if (res.errcode == "") {
        wx.setStorageSync('userInfo', res.userInfo); //昵称，头像
        wx.setStorageSync('openid', res.openid); //openID
        wx.setStorageSync('userLevel', res.userLevel); //角色
        appPage.setData({
          openid: res.openid,
          userInfo: res.userInfo,
          userLevel: res.userLevel
        });
        // // console.log(res.openid)
        // appPage.setData({userInfo:res.userInfo});
        // // console.log(res.userInfo)
        // appPage.setData({userLevel:res.userLevel});                 

      } else {
        var userInfo = {
          avatarUrl: "../../images/gravatar.png",
          nickName: "点击登录",
          isLogin: false
        }
        appPage.setData({
          userInfo: userInfo
        });
        wx.showModal({
          title: '提示',
          content: '登录失败,清除缓存重新登录?',
          success(res) {
            if (res.confirm) {
              Auth.logout(appPage);
              Auth.checkLogin(appPage); //推翻登录流程重头来
              wx.reLaunch({
                url: '../readlog/readlog'
              });

            } else if (res.cancel) {
              wx.reLaunch({
                url: '../index/index'
              });
            }
          }
        })

      }
      appPage.setData({
        isLoginPopup: false
      });



    })
  } else {
    console.log("登录失败");
    wx.showToast({
      title: '登录失败',
      mask: false,
      duration: 1000
    });

  }
}

// Auth.agreeGetUser=function(e,wxLoginInfo,authFlag){
//         return new Promise(function(resolve, reject) {
//            let args={};
//            let data={};        
//            args.js_code =wxLoginInfo.js_code;
//            if(authFlag=='0'  && e.detail.errMsg=='getUserInfo:fail auth deny'){
//                 args.errcode=e.detail.errMsg;
//                 args.userInfo={isLogin:false}
//                 args.userSession="";            
//                 resolve(args);
//                 return;
//            } 
//             var userInfoDetail = {};
//             if(authFlag=='0')//未授权过,通过按钮授权
//              {
//                 userInfoDetail = e.detail;
//              }
//             else if(authFlag=='1')//已经授权过，直接通过wx.getUserInfo获取
//             {
//               userInfoDetail = e;
//             }
//             if (userInfoDetail && userInfoDetail.userInfo){
//                 args.iv = userInfoDetail.iv;
//                 args.encryptedData = userInfoDetail.encryptedData;
//                 let userInfo =  userInfoDetail.userInfo;
//                 userInfo.isLogin =true;
//                 args.avatarUrl=userInfo.avatarUrl;
//                 args.nickname=userInfo.nickName;
//                 data.userInfo =userInfo;
//                 var url = Api.getOpenidUrl();        
//                 var postOpenidRequest = wxRequest.postRequest(url, args);
//                 //获取openid
//                 postOpenidRequest.then(response => {
//                     if (response.data.status == '200') {
//                         //console.log(response.data.openid)
//                         console.log("授权登录获取成功");
//                         data.openid= response.data.openid;
//                         var userLevel={};
//                         if(response.data.userLevel)
//                         {
//                             userLevel=response.data.userLevel;
//                         }
//                         else 
//                         {
//                             userLevel.level="0";
//                             userLevel.levelName="订阅者";
//                         }
//                         data.userLevel=userLevel;
//                         data.errcode="";                        
//                         resolve(data);

//                     }
//                     else {
//                         console.log(response);
//                         reject(response);
//                     }
//                 }).catch(function (error) {
//                     console.log('error: ' + error);                        
//                     reject(error);
//                 })

//                 // Auth.userLogin(args,api).then(userSession=>{
//                 //     args.userSession=userSession;
//                 //     args.errcode ="";
//                 //     resolve(args);
//                 // }).catch(function (error) {
//                 //     console.log('error: ' + error);                        
//                 //     reject(error);
//                 // })
//             }
//             else
//             {
//                args.errcode="error";
//                args.userInfo={isLogin:false};
//                args.userSession="";            
//                resolve(args);
//             }
//         }) 
// }

//弹窗内用户点击同意授权触发（将Code，头像，昵称传递给服务器，获取OpenID）
Auth.agreeGetUser = function (e, wxLoginInfo, authFlag) {
  return new Promise(function (resolve, reject) {
    let args = {};
    let data = {};
    args.code = wxLoginInfo.js_code;
    wx.showLoading({
      title: "正在登录...",
      mask: true
    })
    //首先请求了Code，微信服务器就知道该返回哪个用户的Profile信息
    wx.getUserProfile({ //微信接口，生成用户信息（点击了授权就会获取到）
      lang: 'zh_CN',
      desc: '登录后信息展示',
      success: (res) => {
        wx.showToast({
          title: '欢迎:'+res.userInfo.nickName,
          icon: 'success',
          duration: 1666
        })
        // console.log(res);
        let userInfo = res.userInfo || {} //微信服务器传过来的用户信息
        wx.setStorageSync('userInfo', userInfo)

        userInfo.isLogin = true;
        args.avatarUrl = userInfo.avatarUrl;
        args.nickName = userInfo.nickName;

        //   console.log(args);
        data.userInfo = userInfo;
        var url = Api.getOpenidUrl();
        var postOpenidRequest = wxRequest.postRequest(url, args); //args带到本地服务器
        //获取openid
        wx.hideLoading();

        postOpenidRequest.then(response => {
          if (response.data.code == '200') {
            // console.log(response);
            console.log("授权登录获取成功");
            data.openid = response.data.data.openId;
            // console.log(response.header.Authorization);
            wx.setStorageSync('authorization', response.header.Authorization);
            var userLevel = {};
            if (response.data.data.role == "0") {
              userLevel.level = "0";
              userLevel.levelName = "AKU童鞋";

            } else {
              userLevel = response.data.data.role;
            }
            data.userLevel = userLevel;
            data.errcode = "";
            data.userId = response.data.data.id;



            resolve(data);

          } else {
            data.errcode = response.code;
            data.message = response.msg;
            resolve(data);
          }
        })
      },
      fail: (err) => {
        wx.hideLoading();
        if (authFlag == '0' && err.errMsg == 'getUserProfile:fail auth deny') {
          err.errMsg = "用户拒绝了授权";
        }
        args.errcode = err.errMsg;
        args.userInfo = {
          isLogin: false
        }
        args.userSession = "";
        wx.showToast({
          icon: 'none',
          title: err.errMsg || '登录错误，请稍后再试',
        })
        resolve(args);

      },
      complete: (com) => {
        // com.userInfo;

      }
    });

    //    if(authFlag=='0'  && e.detail.errMsg=='getUserInfo:fail auth deny'){
    //         args.errcode=e.detail.errMsg;
    //         args.userInfo={isLogin:false}
    //         args.userSession="";            
    //         resolve(args);
    //         return;
    //    } 
    //     var userInfoDetail = {};
    //     if(authFlag=='0')//未授权过,通过按钮授权
    //      {
    //         userInfoDetail = e.detail;
    //      }
    //     else if(authFlag=='1')//已经授权过，直接通过wx.getUserInfo获取
    //     {
    //       userInfoDetail = e;
    //     }
    //     if (userInfoDetail && userInfoDetail.userInfo){
    //         args.iv = userInfoDetail.iv;
    //         args.encryptedData = userInfoDetail.encryptedData;
    //         let userInfo =  userInfoDetail.userInfo;
    //         userInfo.isLogin =true;
    //         args.avatarUrl=userInfo.avatarUrl;
    //         args.nickname=userInfo.nickName;
    //         data.userInfo =userInfo;
    //         var url = Api.getOpenidUrl();        
    //         var postOpenidRequest = wxRequest.postRequest(url, args);
    //         //获取openid
    //         postOpenidRequest.then(response => {
    //             if (response.data.status == '200') {
    //                 //console.log(response.data.openid)
    //                 console.log("授权登录获取成功");
    //                 data.openid= response.data.openid;
    //                 var userLevel={};
    //                 if(response.data.userLevel)
    //                 {
    //                     userLevel=response.data.userLevel;
    //                 }
    //                 else 
    //                 {
    //                     userLevel.level="0";
    //                     userLevel.levelName="订阅者";
    //                 }
    //                 data.userLevel=userLevel;
    //                 data.errcode="";
    //                 data.userId=  response.data.userId;                      
    //                 resolve(data);

    //             }
    //             else {
    //                 console.log(response);
    //                 reject(response);
    //             }
    //         }).catch(function (error) {
    //             console.log('error: ' + error);                        
    //             reject(error);
    //         })


    //     }
    //     else
    //     {
    //        args.errcode="error";
    //        args.userInfo={isLogin:false};
    //        args.userSession="";            
    //        resolve(args);
    //     }
  })
}
// mark: 为传过来整个APP页面，设置用户信息
Auth.setUserInfoData = function (appPage) {
  if (!appPage.data.openid) { //如果设置了微信用户唯一标识，就不用执行以下，如果没设置就会设置
    appPage.setData({
      userInfo: wx.getStorageSync('userInfo'), //头像昵称等信息
      openid: wx.getStorageSync('openid'), //openID
      userLevel: wx.getStorageSync('userLevel') //用户等级类型
    })

  }

}

//只进行返回Code操作
Auth.wxLogin = function () {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        let args = {};
        args.js_code = res.code;
        resolve(args);
      },
      fail: function (err) {
        console.log(err);
        reject(err);
      }
    });
  })

}

//执行退出登录按钮
Auth.logout = function (appPage) {
  appPage.setData({
    openid: '',
    userLevel: {},
    userInfo: {},
    wxLoginInfo: {}
  })
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('openid');
  wx.removeStorageSync('userLevel');
  wx.removeStorageSync('wxLoginInfo');
  wx.removeStorageSync('authorization');
}

module.exports = Auth;