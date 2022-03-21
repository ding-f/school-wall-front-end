

import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');    //登录相关模块
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
// const Adapter = require('../../utils/adapter.js')    //获取广告设置

const innerAudioContext = wx.createInnerAudioContext();
let ctx = wx.createCanvasContext('mycanvas');  

var app = getApp();
let isFocusing = false
// const pageCount = config.getPageCount;

var webSiteName= config.getWebsiteName;
var blog =config.getBlog;

import { ModalView } from '../../templates/modal-view/modal-view.js'
import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster';
let rewardedVideoAd = null




Page({
  data: {
    title: '文章内容',    //微信内部数据调用浏览标签
    webSiteName:webSiteName,
    detail: {},   //文章具体信息
    commentsList: [],
    // ChildrenCommentsList: [],
    commentCount: '',   //设置评论的数目
    detailDate: '',
    commentValue: '',  
    display: 'none',      // 设置文章、猜你喜欢、评论、等css样式
    showerror: 'none',    // 设置显示的css样式，error：block   默认：none
    page: 1,
    isLastPage: false,
    parentID: "0",
    focus: false,
    placeholder: "评论...",
    postID: null,
    scrollHeight: 0,
    postList: [],   //通过tags获取的文章列表
    link: '',
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    content: '',
    isShow: true,//控制menubox是否显示
    isLoad: true,//解决menubox执行一次  
    menuBackgroup: false,
    likeImag: "like.png",
    likeList: [],     //设置喜欢的用户头像列表
    likeCount: 0,
    displayLike: 'none', 
    userid: "",
    toFromId: "",
    commentdate: "",
    flag: 1,
    // logo: wx.getStorageSync('logoImageurl'),     //此值这个脚本里没有用
    enableComment: true,
    isLoading: false,
    totalComments: 0,
    isLoginPopup: false,
    openid: "",   //用户身份ID
    userInfo: {},
    system: '',   //执行生命周期开始时候识别手机系统，Android/IOS
    // downloadFileDomain: wx.getStorageSync('downloadfileDomain'),
    // businessDomain:wx.getStorageSync('businessDomain'),

    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    // displayAudio: 'none',
    shareImagePath: '',
    detailSummaryHeight: '',    //''不显示阅读更多
    // detailAdsuccess: false,    //小程序广告（false修改为去广告）
    // detailTopAdsuccess:false,    //去除顶部广告（false修改为去广告）
    fristOpen: false,
    blog:blog,
    // detailSummaryHeight: '',    //设置广告高度
    platform: ''    //执行生命周期开始时候识别手机平台

  },


   // mark: 此处获取其他页面传过来的数据并后台准备数据的加载
  onLoad: function (options) {    
    var self = this;
    wx.showShareMenu({     // mark: 转发文章菜单
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline'],
      success:function(e)
      {
        //console.log(e);
      }
    })
    // self.getEnableComment();     // mark: 获取设置是否开启评论
    self.fetchDetailData(options.id);   //获取文章详细数据
    Auth.setUserInfoData(self);   //给当前页设置用户信息
    Auth.checkLogin(self);
    // mark: 119 获取广告
    // Adapter.setInterstitialAd("enable_detail_interstitial_ad");
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';    // mark: 122 识别手机系统
        self.setData({ system: system ,platform: t.platform});
      }
    })
    new ModalView;
  },
  onUnload: function () {
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
    if (rewardedVideoAd && rewardedVideoAd.destroy) { 
      rewardedVideoAd.destroy() 
    }
    innerAudioContext.destroy()
    ctx=null;


  },

  // mark: 展示点赞
  showLikeImg: function () {
    var self = this;
    // var flag = false;
    var _likes = self.data.detail.avatarUrls;     // mark: 142 获取点赞头像链接
    if (!_likes) {
      return;
    }
    var likes = [];
    for (var i = 0; i < _likes.length; i++) {
      var avatarUrl = "../../images/gravatar.png";
      if (_likes[i].avatarUrl.indexOf('wx.qlogo.cn') == -1) {   //头像链接含有wx.qlogo.cn就执行以下
        avatarUrl = _likes[i].avatarUrl;     // mark: 如果在这个域名里包含wx.qlogo.cn，设置头像为此链接头像
      }
      likes[i] = avatarUrl;   //如果不包含wx.qlogo.cn，就会设置本地头像[晕头小可爱]
    }
    // var temp = likes;
    self.setData({
      likeList: likes     //将处理后的头像链接数组赋值到本地
    });
  },


  // mark: 上拉触底时间，加载评论
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      console.log('当前页' + self.data.page);
      self.fetchCommentData();
      self.setData({
        page: self.data.page + 1,
      });
    }
    else {
      console.log('评论已经是最后一页了');
    }

  },
  
  // 首次加载评论，点击文章时调用
   fristOpenComment() {    
    this.setData({   
      page :1,    //评论进行分页处理
      commentsList: [],
      isLastPage: false
    })

    this.fetchCommentData();    //调用内部函数

    this.setData({
      page: this.data.page + 1,   //给onReachBottom设置第二页，下拉刷新才可以保证不是第一页的评论
    });
  },

  onShareAppMessage: function (res) {
    this.ShowHideMenu();
    console.log(res);
    return {
      title: '分享"' + webSiteName + '"的文章：' + this.data.detail.title.rendered,
      path: 'pages/detail/detail?id=' + this.data.detail.id,
      imageUrl: this.data.detail.post_full_image,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
        // 转发失败
      }
    }
  },
    // 自定义分享朋友圈
  onShareTimeline: function() {
    let imageUrl = this.data.detail.post_full_image
    return {
      title: this.data.detail.title.rendered,
      query: {
        id: this.data.detail.id
      },
      imageUrl
    }
  },
  gotowebpage: function () {
    var self = this;
    self.ShowHideMenu();
    var enterpriseMinapp = self.data.detail.enterpriseMinapp;
    var url = '';
    if (enterpriseMinapp == "1") {
      var url = '../webpage/webpage';
      wx.navigateTo({
        url: url + '?url=' + self.data.link
      })
    }
    else {
      self.copyLink(self.data.link);
    }

  },
// mark: 235 将复制到的链接写入剪切板并提示用户
  copyLink: function (url) {
    wx.setClipboardData({
      data: url,    //设置数据到剪切板数据data
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '链接已复制,可粘贴到浏览器进行访问哦~',
              image: '../../images/link.png',
              duration: 5000
            })
          }
        })
      }
    })
  },
  clickLike: function (e) {
    var id = e.target.id;
    var self = this;
    if (id == 'likebottom') {
      this.ShowHideMenu();
    }

    if (self.data.openid) {
      var data = {
        openid: self.data.openid,
        postid: self.data.postID
      };
      var url = Api.postLikeUrl();
      var postLikeRequest = wxRequest.postRequest(url, data);
      postLikeRequest
        .then(response => {
          if (response.data.status == '200') {
            var _likeList = []
            var _like = self.data.userInfo.avatarUrl;
            _likeList.push(_like);
            var tempLikeList = _likeList.concat(self.data.likeList);
            var _likeCount = parseInt(self.data.likeCount) + 1;
            self.setData({
              likeList: tempLikeList,
              likeCount: _likeCount,
              displayLike: 'block'
            });
            wx.showToast({
              title: '谢谢点赞',
              icon: 'success',
              duration: 900,
              success: function () {
              }
            })
          }
          else if (response.data.status == '501') {
            console.log(response.data.message);
            wx.showToast({
              title: '谢谢，已赞过',
              icon: 'success',
              duration: 900,
              success: function () {
              }
            })
          }
          else {
            console.log(response.data.message);

          }
          self.setData({
            likeImag: "like-on.png"
          });
        })
    }
    else {
      Auth.checkSession(self, 'isLoginNow');

    }
  },

   // mark: 判断当前用户是否点赞
  getIslike: function () { 
    var self = this;
    if (self.data.openid) {   //验证是否登录
      var data = {
        openid: self.data.openid,   //猜测这个应该是微信后台的
        postid: self.data.postID    //猜测这个应该是三方服务器的
      };
      var url = Api.postIsLikeUrl();
      var postIsLikeRequest = wxRequest.postRequest(url, data);
      postIsLikeRequest
        .then(response => {
          if (response.data.status == '200') {    //查询到当前用户已经点赞，才会返回状态码200
            self.setData({
              likeImag: "like-on.png"   
            });

            console.log("已赞过");
          }

        })

    }
  },
  goHome: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },

  // mark: 339 实现打赏按钮，所有项目生效
  praise: function () {
    this.ShowHideMenu();
    var self = this;
    var enterpriseMinapp = self.data.detail.enterpriseMinapp;
    var system = self.data.system;
    var praiseWord=self.data.detail.praiseWord;
    if (enterpriseMinapp == "1" && system == 'Android') { //如果是企业minapp==‘1‘并且系统为Android
      if (self.data.openid) {   //如果用户已经登录
        wx.navigateTo({
          //直接去打赏页面
          url: '../pay/pay?flag=1&openid=' + self.data.openid + '&postid=' + self.data.postID+'&praiseWord='+praiseWord
        })
      }
      else {//否则：去登录页面
        Auth.checkSession(self, 'isLoginNow');
      }
    }
    else if(enterpriseMinapp == "0" || system=='iOS'){  //你手机是IOS或者企业minapp==‘0‘，满足一项即可

      var src = wx.getStorageSync('zanImageurl');
      wx.previewImage({   // 直接弹出打赏二维码
        urls: [src],
      });

    }
  },

  // mark: 获取是否开启评论设置
  // getEnableComment: function (id) {
  //   var self = this;
  //   var getEnableCommentRequest = wxRequest.getRequest(Api.getEnableComment());
  //   getEnableCommentRequest
  //     .then(response => {
  //       if (response.data.enableComment != null && response.data.enableComment != '') {
  //         if (response.data.enableComment === "1") {
  //           self.setData({
  //             enableComment: true
  //           });
  //         }
  //         else {
  //           self.setData({
  //             enableComment: false
  //           });
  //         }

  //       };

  //     });
  // },



  // mark: 根据文章ID获取文章内容
  fetchDetailData: function (id) {
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    var res;
    var _displayLike = 'none';
    getPostDetailRequest
      .then(response => {
        res = response;

        //404找不到文章，状态码false，只要有一项就是错误的
        if (response.data.code && (response.data.data.code == "404")) {
          self.setData({
            showerror: 'block',
            display: 'none',
            // detailAdsuccess:false,    //false去广告，之前是true
            // detailTopAdsuccess:true,
            errMessage: response.data.message
          });
          return false;
        }

        // 设置页面标题：文章分类
        if(res.data.categoryId)    //"categoryId": "WordPress",   // mark: 405 （微信页面标签）
        {
          wx.setNavigationBarTitle({
            // title: res.data.title.rendered
            title: res.data.categoryId   //页面标签
          });
        }
        
       //计算多少条评论
        if (response.data.totalComments != null && response.data.totalComments != '') {
          self.setData({
            commentCount: "有" + response.data.totalComments + "条评论" // mark: 416 设置一共多少条评论
          });
        };
        var _likeCount = response.data.likeCount;     // mark: 419 喜欢计数
        if (response.data.likeCount != '0') {    //如果喜欢不为0，设置样式
          _displayLike = "block"
        }
        
        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || [];   //从前到后执行，ture时就会执行，false继续往后，直到执行成功返回结果
        // 过滤重复值，如果里面有重复的文章ID直接过滤掉 // mark: 426 去除重复ID的文章
        if (logs.length > 0) {
          logs = logs.filter(function (log) {
            return log[0] !== id;   //id是传过来的文章ID
          });
        }
        // 如果超过指定数量
        if (logs.length > 19) {   //最多存放20个元素
          logs.pop();//去除最后一个
        }
        logs.unshift([id, response.data.title]); //加上现在获取到的[id,标题]
        wx.setStorageSync('readLogs', logs);    //将这个数组覆盖掉

        // var openAdLogs = wx.getStorageSync('openAdLogs') || [];
        // var openAded = res.data.excitationAd == '1' ? false : true;
        // if (openAdLogs.length > 19) {   //大于19开启广告
        //   openAded = false; // mark: 442 去除设置广告，设置为false（不显示广告）
        // } else if (openAdLogs.length > 0 && res.data.excitationAd == '1') {    // mark: 443 是否开启广告日志 1 开启
        //   for (var i = 0; i < openAdLogs.length; i++) {
        //     if (openAdLogs[i].id == res.data.id) {  //一个文章包含一个广告，如果找到设置的openAdLogs[i].id == res.data.id那就会设置这条广告
        //       openAded = false;    // mark: 446 去除设置广告，设置为false（不显示广告）
        //       break;
        //     }


        //   }
        // }

        // if (res.data.excitationAd == '1') {   // 1代表： 一篇文章设置了激励广告
        //   self.loadInterstitialAd(res.data.rewardedVideoAdId);     // mark: 455 设置视频广告rewardedVideoAdId
        // }

        self.setData({    
          detail: response.data,    //设置文章所有信息
          likeCount: _likeCount,    //设置点赞数
          postID: id,               //设置文章Id
          // link: response.data.link, //设置文章链接（无数据项）
          detailDate: util.cutstr(response.data.date, 10, 1),   //文章的发布时间，只裁剪到年月日
          display: 'block',
          displayLike: _displayLike,     // mark: 465 如果有喜欢数，把喜欢数设置出显示效果
          totalComments: response.data.totalComments,   //设置评论总数
          // postImageUrl: response.data.postImageUrl,     //设置文章主题图片（无效数据）
          // detailSummaryHeight: openAded ? '' : '400rpx'   //设置广告高度

        });

        // return response.data    //这么写第二次就不用再进行.data了
      })
      // .then(response => {   //第二次 // mark: 获取声音（直接可以去除掉这个功能）

      //   // if(response.audios.length>0  && response.audios[0].src !='' )
      //   // {
      //   //    //加载声音模块并播放
      //   //   self.InitializationAudio( response.audios[0].src);   
      //   //   self.loadAudio();
      //   //   self.setData({
      //   //     displayAudio: "block"
      //   //   });
      //   // }


      // })
      // .then(response => {
      //   // mark: 489 设置文章标签
      //   var tagsArr = [];
      //   tagsArr = res.data.tags   //此处的文章标签是一个数组
      //   if (!tagsArr) {
      //     return false;
      //   }
      //   var tags = "";
      //   for (var i = 0; i < tagsArr.length; i++) {  //本文章有tags就设置tags
      //     if (i == 0) {
      //       tags += tagsArr[i];
      //     }
      //     else {
      //       tags += "," + tagsArr[i];
      //     }
      //   }
      //   if (tags != "") {
      //     // mark: 505 通过tages获取文章列表
      //     var getPostTagsRequest = wxRequest.getRequest(Api.getPostsByTags(id, tags));
      //     getPostTagsRequest
      //       .then(response => {
      //         self.setData({
      //           postList: response.data    // mark: 510 获取到文章列表
      //         });
      //       })
      //   }
      // })


      .then(response => {   //获取点赞记录
        self.showLikeImg();    // mark: 519 调用点赞用户头像列表
      }).then(resonse => {
        if (self.data.openid) {   //openID 微信用户唯一标识，此处的if验证是否登录
          Auth.checkSession(self, 'isLoginLater');    //'isLoginNow'==flag才弹出登录框，这个不提示弹出登录框
        }
      }).then(response => {//获取是否已经点赞
        if (self.data.openid) {
          self.getIslike();
        }
      }).then(res=>{
          self.fristOpenComment();    
      })
      .catch(function (error) {
        console.log('error: ' + error);
      })
  },
//////////////////////////


  //拖动进度条事件
  sliderChange:function(e) {
    var that = this;
    innerAudioContext.src = this.data.detail.audios[0].src;
    //获取进度条百分比
    var value = e.detail.value;
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    //更改状态
    this.setData({ audioSeek: value, isPlayAudio: true });
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    //播放歌曲
    innerAudioContext.play();
  },

  
  //初始化播放器，获取duration
 InitializationAudio:function (audiosrc) {
  var self = this;
  //设置src
  innerAudioContext.src = audiosrc;
  //运行一次
  //innerAudioContext.play();
  innerAudioContext.autoplay = false;
  innerAudioContext.pause();
  innerAudioContext.onCanplay(() => {
    //初始化duration
    innerAudioContext.duration
    setTimeout(function() {
      //延时获取音频真正的duration
      var duration = innerAudioContext.duration;
      var min = parseInt(duration / 60);
      var sec = parseInt(duration % 60);
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      self.setData({
        audioDuration: innerAudioContext.duration,
        showTime2: `${min}:${sec}`
      });
    }, 1000)
  })

},

 loadAudio :function() {
  var that = this;
  //设置一个计步器
  that.data.durationIntval = setInterval(function() {
    //当歌曲在播放时执行
    if (that.data.isPlayAudio == true) {
      //获取歌曲的播放时间，进度百分比
      var seek = that.data.audioSeek;
      var duration = innerAudioContext.duration;
      var time = that.data.audioTime;
      time = parseInt(100 * seek / duration);
      //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
      var min = parseInt((seek + 1) / 60);
      var sec = parseInt((seek + 1) % 60);
      //填充字符串，使3:1这种呈现出 03：01 的样式
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      var min1 = parseInt(duration / 60);
      var sec1 = parseInt(duration % 60);
      if (min1.toString().length == 1) {
        min1 = `0${min1}`;
      }
      if (sec1.toString().length == 1) {
        sec1 = `0${sec1}`;
      }
      //当进度条完成，停止播放，并重设播放时间和进度条
      if (time >= 100) {
        innerAudioContext.stop();
        that.setData({
          audioSeek: 0,
          audioTime: 0,
          audioDuration: duration,
          isPlayAudio: false,
          showTime1: `00:00`
        });
        return false;
      }
      //正常播放，更改进度信息，更改播放时间信息
      that.setData({
        audioSeek: seek + 1,
        audioTime: time,
        audioDuration: duration,
        showTime1: `${min}:${sec}`,
        showTime2: `${min1}:${sec1}`
      });
    }
  }, 1000);
},

 playAudio :function() {
  //获取播放状态和当前播放时间  
  var  self=this;
  var isPlayAudio = self.data.isPlayAudio;
  var seek = self.data.audioSeek;
  innerAudioContext.pause();
  //更改播放状态
  self.setData({
    isPlayAudio: !isPlayAudio
  })
  if (isPlayAudio) {
    //如果在播放则记录播放的时间seek，暂停
    self.setData({
      audioSeek: innerAudioContext.currentTime
    });
  } else {
    //如果在暂停，获取播放时间并继续播放
    innerAudioContext.src = self.data.detail.audios[0].src;
    if (innerAudioContext.duration != 0) {
      self.setData({
        audioDuration: innerAudioContext.duration
      });
    }
    //跳转到指定时间播放
    innerAudioContext.seek(seek);
    innerAudioContext.play();
  }
},

  //给a标签添加跳转和复制链接事件 // mark: 678 解析文章内容的a标签 只有wxml内部属性bindlinktap="wxParseTagATap" 调用
  wxParseTagATap: function (e) {
    // e是传递过来的整个a链接
    let self = this
    let href = e.detail.src || e.detail.href
    let domain = config.getDomain
    // let appid = e.detail.appid
    let redirectype = e.detail.redirectype
    // let path = e.detail.path


    // mark: 693 判断a标签src里是不是插入的文档链接
     let isDoc = /\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/.test(href)

    // if (isDoc) {
    //   this.openLinkDoc(e)   //内部处理方法打开文档
    //   return
    // }

    if(redirectype) {
      // if (redirectype == 'apppage') { //跳转到小程序内部页面         
      //   wx.navigateTo({
      //     url: path
      //   })
      // } else if (redirectype == 'webpage') //跳转到web-view内嵌的页面
      // {
        href = '../webpage/webpage?url=' + href;    // // mark: 707 只要是定义了a标签定义了redirectype，就会跳转到网页处理页面
        wx.navigateTo({
          url: href
        })
      // }
      // else if (redirectype == 'miniapp') //跳转其他小程序
      //  {
      //   wx.navigateToMiniProgram({
      //     appId: appid,
      //     path: path
      //   })
      // }
      return;
    }


    var enterpriseMinapp = self.data.detail.enterpriseMinapp;   //文章中的enterpriseMinapp字段是1就是本博客企业小程序
    
    //可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {   //如果域名不含有本站后端域名，比如0.0.0.0：80

      // var n=0;
      // for (var i = 0; i < self.data.businessDomain.length; i++) {
  
      //   if (href.indexOf(self.data.businessDomain[i].domain) != -1) {
      //     n++;
      //     break;
      //   }
      // }

      // if(n>0)   //却包含了以上自定义的域名["blog.minapper.com","plus.minapper.com","blog.minapper.com","www.minapper.com","www.watch-life.net"]
      // {
      //   var url = '../webpage/webpage'
      //   if (enterpriseMinapp == "1") {  //本站minapp网页直接打开网页美化页面
      //     url = '../webpage/webpage';
      //     wx.navigateTo({
      //       url: url + '?url=' + href
      //     })
      //   }
      //   else {    //如果都不属于直接复制链接到剪切板
      //     self.copyLink(href);
      //   }
      // }
      // else
      // {
        self.copyLink(href);  //即不属于minapp也不属于设置的包含域名  // mark: 752 修改成如果不是本站后端域名直接复制到剪切板

      // }

    }
    else {    //如果含有本站后端域名，比如0.0.0.0：80   // mark: 757 获取a标签中链接的末端的文件名
      var slug = util.GetUrlFileName(href, domain);   // 得到链接末尾文件的文件名,如果域名结尾包含 // mark: 759 得到链接末尾文件的文件名
      if(slug=="")    //不是本站域名也不是文件
      {
          // var url = '../webpage/webpage'
          // // if (enterpriseMinapp == "1") {
          //   url = '../webpage/webpage';
          //   wx.navigateTo({
          //     url: url + '?url=' + href
          //   })
          // }
          // else {
             self.copyLink(href);   //复制到剪切板并提醒
          // }
        return;

      }
      if (slug == 'index') {    //a链接是本站后端域名或者未定义地址
        wx.switchTab({
          url: '../index/index'
        })
      }
      else {   // mark: 780 a链接是本站后端域名且包含本站文章地址
        ///////获取文章通过slug
        var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
        getPostSlugRequest
          .then(res => {
            if (res.statusCode == 200) {
              if (res.data.length != 0) {
                var postID = res.data[0].id;
                var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
                if (openLinkCount > 4) {
                  wx.redirectTo({
                    url: '../detail/detail?id=' + postID
                  })
                }
                else {
                  wx.navigateTo({
                    url: '../detail/detail?id=' + postID
                  })
                  openLinkCount++;
                  wx.setStorageSync('openLinkCount', openLinkCount);
                }
              }
              else {    //本站文章不存在
                
                var url = '../webpage/webpage'
                if (enterpriseMinapp == "1") {    //如果是文章不存在且是本程序企业APP文章直接跳转
                  url = '../webpage/webpage';
                  wx.navigateTo({
                    url: url + '?url=' + href
                  })
                }
                else {
                  self.copyLink(href);    //普通文章不存在，直接复制
                }


              }

            }

          }).catch(res => {
            console.log(response.data.message);
          })
      }
    }

  },

   // mark: 822 下载并打开文档（此处处理当心 let src = e.currentTarget.dataset.src ）由于e传过来的整个a链接
  //  openLinkDoc(e) {
     
  //   let self = this
  //   let url
  //   let fileType
    
  //   // 如果是a标签href中插入的文档
  //   let src = e.currentTarget.dataset.src   
  //   var n=0;
  //   for (var i = 0; i < self.data.downloadFileDomain.length; i++) {

  //     if (src.indexOf(self.data.downloadFileDomain[i]) != -1) {
  //       n++;    //直到找到来自downloadFileDomain的域名才进行下载打开操作。
  //       break;
  //     }
  //   }

  //   if(n==0)
  //   {
  //     self.copyLink(src);
  //     return;
  //   }

  //   // let docType
  //   let isDoc = /\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/.test(src)

  //   if (src && isDoc){     // mark: 848 判断打开的链接是办公文档文件
  //     url = src
  //     fileType = /doc|docx|xls|xlsx|ppt|pptx|pdf$/.exec(src)[0]
  //   } else {
  //     url = e.currentTarget.dataset.filelink    //不是办公文档文件，直接把filelink（文件链接）赋值进url后期处理
  //     fileType = e.currentTarget.dataset.filetype //同上
  //   }

  //   wx.downloadFile({
  //     url: url,   //下载文件地址
  //     success: function (res) { //执行url下载
  //       const filePath = res.tempFilePath //存入临时地址
  //       wx.openDocument({    // mark: 打开办公文档
  //         filePath: filePath,
  //         fieldType: fileType
  //       })
  //     },
  //     fail: function (error) {
  //       console.log('下载文档失败:' + error)
  //     }
  //   })
  // },

  // mark: 获取评论
  fetchCommentData: function () {
    var self = this;
    let args = {};
    args.postId = self.data.postID;
    // args.limit = pageCount;   //评论加载每页多少条
    args.page = self.data.page;   //评论页第几页

    self.setData({ isLoading: true })

    var getCommentsRequest = wxRequest.getRequest(Api.getCommentsReplay(args));    // mark: API处获取评论列表
    getCommentsRequest
      .then(response => {
        if (response.statusCode == 200) {   
          if (response.data.data.length < 10) {
            self.setData({
              isLastPage: true
            });
          }
          if (response.data) {
            self.setData({
              commentsList: [].concat(self.data.commentsList, response.data.data)
            });
          }
        }
      })
      .catch(response => {
        console.log(response.data.msg);

      }).finally(function () {
        self.setData({
          isLoading: false
        });
      });
  },
  //显示或隐藏功能菜单
  ShowHideMenu: function () {
    this.setData({
      //isShow: !this.data.isShow,
      isLoad: false,
      menuBackgroup: !this.data.false
    })
  },
  //点击非评论区隐藏功能菜单
  hiddenMenubox: function () {
    this.setData({
      //isShow: false,
      menuBackgroup: false
    })
  },
  //底部刷新
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchCommentData();
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  replay: function (e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var userid = e.currentTarget.dataset.userid;
    isFocusing = true;
    if (self.data.enableComment == "1") {
      self.setData({
        parentID: id,
        placeholder: "回复" + name + ":",
        focus: true,
        userid: userid    
      });

    }
    // console.log('toFromId', toFromId);
    // console.log('replay', isFocusing);
  },
  onReplyBlur: function (e) {
    var self = this;
    // console.log('onReplyBlur', isFocusing);
    if (!isFocusing) {
      {
        const text = e.detail.value.trim();
        if (text === '') {
          self.setData({
            parentID: "0",
            placeholder: "评论...",
            userid: ""         
          });
        }

      }
    }
    // console.log(isFocusing);
  },
  onRepleyFocus: function (e) {
    var self = this;
    isFocusing = false;
    if (!self.data.focus) {
      self.setData({ focus: true })
    }
  },
   // mark:提交评论 
  formSubmit: function (e) {
    var self = this;
    var comment = e.detail.value.inputComment;
    var parent = self.data.parentID;
    var postID = e.detail.value.inputPostID;    
    var userid = self.data.userid;
    if (comment.length === 0) {
      self.setData({
        'dialog.hidden': false,
        'dialog.title': '提示',
        'dialog.content': '没有填写评论内容。'

      });
    }
    else {
      if (self.data.openid) {
        var name = self.data.userInfo.nickName;
        var author_url = self.data.userInfo.avatarUrl;
        var email = self.data.openid + "@qq.com";
        var openid = self.data.openid;
     
        var data = {
          post: postID,
          author_name: name,
          author_email: email,
          content: comment,
          author_url: author_url,
          parent: parent,
          openid: openid,
          userid: userid
        };
        var url = Api.postWeixinComment();
        var postCommentRequest = wxRequest.postRequest(url, data);
        var postCommentMessage = "";
        postCommentRequest
          .then(res => {
            console.log(res)
            var code =res.data.code;
            if(res.data.code =='success')
            {

                self.setData({
                  content: '',
                  parentID: "0",
                  userid: 0,
                  placeholder: "评论...",
                  focus: false,
                  commentsList: []

                });

                wx.showToast({
                  title: res.data.message,
                  mask: false,
                  icon: "none",
                  duration: 3000
                });
                postCommentMessage = res.data.message;                
                var commentCounts = parseInt(self.data.totalComments) + 1;
                self.setData({
                  totalComments: commentCounts,
                  commentCount: "有" + commentCounts + "条评论"

                });
            
            }            
            else {

              if (res.data.code == 'rest_comment_login_required') {
              wx.showToast({
                title: '需要开启在WordPress rest api 的匿名评论功能！',
                icon: 'none',
                duration: 3000,
                success: function () {
                }
              })

               
              }
              else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                wx.showToast({
                  title:  'email填写错误！',
                  icon: 'none',
                  duration: 3000,
                  success: function () {
                  }
                })
               
              }
              else if (res.data.code == '87014') {
                wx.showToast({
                  title:  '内容含有违法违规内容!',
                  icon: 'none',
                  duration: 3000,
                  success: function () {
                  }
                })
               
              }
              else {
                console.log(res)
                wx.showToast({
                  title:  res.data.message,
                  icon: 'none',
                  duration: 3000,
                  success: function () {
                  }
                })               
              }
            }

            return res ;
          }).then(res => {
            
            if(res.data.code=='success' && res.data.comment_approved=="1")
            {
              
              self.fristOpenComment();  
            }
                     
          }).catch(response => {
            console.log(response)
            wx.showToast({
              title:  '评论失败:'+response,
              icon: 'none',
              duration: 3000,
              success: function () {
              }
            })  
          })
      }
      else {
        Auth.checkSession(self, 'isLoginNow');

      }

    }

  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');;

  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  onPosterSuccess(e) {
    const { detail } = e;
    this.showModal(detail);
  },
  onPosterFail(err) {
    wx.showToast({
      title: err,
      mask: true,
      duration: 2000
    });
  },

  onCreatePoster: function () {
    var self = this;
    this.ShowHideMenu();
    if (self.data.openid) {
      self.creatArticlePoster(self, Api, util, self.modalView, Poster);
    }
    else {
      Auth.checkSession(self, 'isLoginNow');

    }

  },

  showModal: function (posterPath) {
    this.modalView.showModal({
      title: '保存至相册可以分享给好友',
      confirmation: false,
      confirmationText: '',
      inputFields: [{
        fieldName: 'posterImage',
        fieldType: 'Image',
        fieldPlaceHolder: '',
        fieldDatasource: posterPath,
        isRequired: false,
      }],
      confirm: function (res) {
        console.log(res)
      }
    })
  },

   // mark: 1182 创建文章海报
  creatArticlePoster: function (appPage, api, util, modalView, poster) {   
    var postId = appPage.data.detail.id;
    var title = appPage.data.detail.title.rendered;
    var excerpt = appPage.data.detail.excerpt.rendered ? appPage.data.detail.excerpt.rendered : '';
    if (excerpt && excerpt.length != 0 && excerpt != '') {
      excerpt = util.removeHTML(excerpt);
    }
    var postImageUrl = "";//海报图片地址
    var posterImagePath = "";
    var qrcodeImagePath = "";//二维码图片的地址
    var flag = false;
    var imageInlocalFlag = false;
    var downloadFileDomain = appPage.data.downloadFileDomain;
    // var logo = appPage.data.logo;
    var defaultPostImageUrl = appPage.data.detail.postImageUrl;
    var postImageUrl = appPage.data.detail.post_full_image;


    //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
    if (postImageUrl) {
      var n = 0;
      for (var i = 0; i < downloadFileDomain.length; i++) {

        if (postImageUrl.indexOf(downloadFileDomain[i]) != -1) {
          n++;
          break;
        }
      }
      if (n == 0) {
        imageInlocalFlag = true;
        postImageUrl = defaultPostImageUrl;

      }

    } else {
      postImageUrl = defaultPostImageUrl;
    }

    if(!postImageUrl)
    {
      
      wx.showToast({
        title: '文章没有图片且插件未设置默认海报封面图',
        icon: 'none',
        duration: 3000,
        success: function () {
        }
      })
      return;

    }
    var posterConfig = {
      width: 750,
      height: 1200,
      backgroundColor: '#fff',
      debug: false

    }
    var blocks = [
      {
        width: 690,
        height: 808,
        x: 30,
        y: 183,
        borderWidth: 2,
        borderColor: '#f0c2a0',
        borderRadius: 20,
      },
      {
        width: 634,
        height: 74,
        x: 59,
        y: 680,
        backgroundColor: '#fff',
        opacity: 0.5,
        zIndex: 100,
      }
    ]
    var texts = [];
    texts = [
      {
        x: 113,
        y: 61,
        baseLine: 'middle',
        text: appPage.data.userInfo.nickName,
        fontSize: 32,
        color: '#8d8d8d',
        width: 570,
        lineNum: 1
      },
      {
        x: 32,
        y: 113,
        baseLine: 'top',
        text: '发现不错的文章推荐给你',
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 59,
        y: 770,
        baseLine: 'middle',
        text: title,
        fontSize: 38,
        color: '#080808',
        marginLeft: 30,
        width: 570,
        lineNum: 2,
        lineHeight: 50
      },
      {
        x: 59,
        y: 875,
        baseLine: 'middle',
        text: excerpt,
        fontSize: 28,
        color: '#929292',
        width: 560,
        lineNum: 2,
        lineHeight: 50
      },
      {
        x: 350,
        y: 1130,
        baseLine: 'top',
        text: '长按识别小程序码,立即阅读',
        fontSize: 30,
        color: '#080808',
      }
    ];


    posterConfig.blocks = blocks;//海报内图片的外框
    posterConfig.texts = texts; //海报的文字
    var url = Api.creatPoster();
    var path = "pages/detail/detail?id=" + postId;
    var data = {
      postid: postId,
      path: path

    };
    var creatPosterRequest = wxRequest.postRequest(url, data);
    creatPosterRequest.then(res => {
      if (res.data.code == 'success') {
        qrcodeImagePath = res.data.qrcodeimgUrl;


        var images = [
          {
            width: 62,
            height: 62,
            x: 32,
            y: 30,
            borderRadius: 62,
            url: appPage.data.userInfo.avatarUrl, //用户头像
          },
          {
            width: 634,
            height: 475,
            x: 59,
            y: 210,
            url: postImageUrl,//海报主图
          },
          {
            width: 220,
            height: 220,
            x: 92,
            y: 1020,
            url: qrcodeImagePath,//二维码的图
          }
        ];

        posterConfig.images = images;//海报内的图片
        appPage.setData({ posterConfig: posterConfig }, () => {
          poster.create(true);    //生成海报图片
        });

      }
      else {
        wx.showToast({
          title: res.message,
          mask: true,
          duration: 2000
        });
      }
    });
  },

  // mark: 广告错误log打印模块
  // adbinderror: function (e) {
  //   var self = this;
  //   console.log(e.detail.errCode);
  //   console.log(e.detail.errMsg);
  //   if (e.detail.errCode) {
  //     self.setData({ detailAdsuccess: false })

  //   }
  // },
  // adTopbinderror: function (e) {
  //   var self = this;
  //   console.log(e.detail.errCode);
  //   console.log(e.detail.errMsg)
  //   if (e.detail.errCode) {
  //     self.setData({ detailTopAdsuccess: false })

  //   }
  // },


  // mark: 1377 加载间隙广告
  // loadInterstitialAd: function (excitationAdId) {  
  //   var self = this;

  //   //  mark: 1381 设置视频广告
  //   if (wx.createRewardedVideoAd) {
  //     rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: excitationAdId })
  //     rewardedVideoAd.onLoad(() => {
  //       console.log('onLoad event emit')
  //     })
  //     rewardedVideoAd.onError((err) => {
  //       console.log(err);
  //       this.setData({
  //         detailSummaryHeight: ''   //设置广告高度0
  //       })
  //     })


  //     // 1395 mark: 加载设置帖子广告
  //     rewardedVideoAd.onClose((res) => {    //这个res应该是广告的res

  //       var id = self.data.detail.id;   //本文章的ID
  //       if (res && res.isEnded) {   //res加载到&&未加载到但已加载结束

  //         var nowDate = new Date();
  //         nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

  //         var openAdLogs = wx.getStorageSync('openAdLogs') || [];
  //         // 过滤重复广告
  //         if (openAdLogs.length > 0) {
  //           openAdLogs = openAdLogs.filter(function (log) {
  //             return log["id"] !== id;
  //           });
  //         }
  //         // 如果超过指定数量不再记录
  //         if (openAdLogs.length < 21) {   //最大广告数量为21
  //           var log = {
  //             "id": id,   //为某些文章ID设置广告
  //             "date": nowDate
  //           }
  //           openAdLogs.unshift(log);    //设置进数组
  //           wx.setStorageSync('openAdLogs', openAdLogs);
  //           console.log(openAdLogs);

  //         }
  //         this.setData({
  //           detailSummaryHeight: ''
  //         })
  //       } else {    //如果未加载完广告，直接关闭，那就会弹出广告未加载完

  //         wx.showToast({
  //           title: "你中途关闭了视频",
  //           icon: "none",
  //           duration: 3000
  //         });

          
  //       }
  //     })
  //   }

  // },

  // 阅读更多 // mark: 1457 奖励视频
  // readMore: function () {
  //   var self = this;

  //   var platform = self.data.platform
  //   if (platform == 'devtools') {

  //     wx.showToast({
  //       title: "开发工具无法显示激励视频",
  //       icon: "none",
  //       duration: 2000
  //     });

  //     self.setData({
  //       detailSummaryHeight: ''
  //     })
  //   }
  //   else {

  //     rewardedVideoAd.show()
  //       .catch(() => {
  //         rewardedVideoAd.load()
  //           .then(() => rewardedVideoAd.show())
  //           .catch(err => {
  //             console.log('激励视频 广告显示失败');
  //             self.setData({
  //               detailSummaryHeight: ''
  //             })
  //           })
  //       })

  //   }

  // }

})