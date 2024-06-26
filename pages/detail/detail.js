import config from '../../utils/config.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js'); //登录模块
// var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
// const Adapter = require('../../utils/adapter.js')    //获取广告设置

const innerAudioContext = wx.createInnerAudioContext();
//  let ctx = wx.createCanvasContext('mycanvas');  

var app = getApp();
// let isFocusing = false
const replyCount = config.getReplyCount;

var webSiteName = config.getWebsiteName;
var blog = config.getBlog;


import {
  ModalView
} from '../../templates/modal-view/modal-view.js'
import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster';
// let rewardedVideoAd = null




Page({
  data: {
    
    title: '帖子内容', //微信内部数据调用浏览标签
    webSiteName: webSiteName,
    wxId:"",
    detail: {}, //帖子具体信息
    authorID: null,
    authorInfo: {
      "wxName": "匿名小可爱",
      "role": "游客"
    },
    likerInfo: {

    },
    showAuthorCard: false,
    showUserCard: false,
    imagesList: [],

    commentsList: [],
    // ChildrenCommentsList: [],
    commentCount: 0, //设置评论的数目
    detailDate: '',   //全格式时间
    cutDate: '',    //剪切时间 年-月-日
    commentValue: '',
    display: 'none', // 设置帖子、猜你喜欢、评论、等css样式
    showerror: 'none', // 设置显示的css样式，error：block   默认：none
    page: 1,
    isLastPage: false,
    parentID: 0, //父级评论ID
    focus: false,
    placeholder: "回复此墙帖",
    postID: null,

    isFatherReply: true,

    scrollHeight: 0,

    postList: [], //通过tags获取的帖子列表

    link: '',
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    content: '',
    isShow: true, //控制menubox是否显示
    isLoad: true, //解决menubox执行一次  
    menuBackgroup: false,
    likeImag: "like.png",
    likeList: [], //设置喜欢的用户头像列表
    likeCount: 0,
    displayLike: 'none',
    receiveUserid: 0,
    toFromId: "",
    commentdate: "",
    flag: 1,
    // logo: wx.getStorageSync('logoImageurl'),     //此值这个脚本里没有用
    enableComment: true,
    isLoading: false,
    // totalComments: 0,
    isLoginPopup: false,

    openid: "", //用户身份ID（登录用户身份ID）
    userid: 0, //登录用户ID

    userInfo: {}, //用户信息
    system: '', //执行生命周期开始时候识别手机系统，Android/IOS
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
    detailSummaryHeight: '', //''不显示阅读更多
    // detailAdsuccess: false,    //小程序广告（false修改为去广告）
    // detailTopAdsuccess:false,    //去除顶部广告（false修改为去广告）
    fristOpen: false,
    blog: blog,
    // detailSummaryHeight: '',    //设置广告高度
    platform: '' ,//执行生命周期开始时候识别手机平台

    qrTxt: '',
    qrImage: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Ne1NOq8ScicXNY7U8qtbU4JXAGNKOuibrrRKDRHxHvPcR5EoD0K2cDIU1Xyk16yUdcKON61RRTRt0SianCegtsYzg/132',
  },


  // mark: 此处获取其他页面传过来的数据并后台准备数据的加载
  onLoad: function (options) {
    
    var self = this;
    wx.showShareMenu({ // mark: 转发帖子菜单
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function (e) {
        //console.log(e);
      }
    })
    // self.getEnableComment();     // mark: 获取设置是否开启评论
    self.fetchDetailData(options.id); //获取帖子详细数据
    Auth.setUserInfoData(self); //给当前页设置用户信息
    Auth.checkLogin(self); //检查微信服务器session_key是否有效，session无效||code丢失 重新设置code信息
    // mark: 119 获取广告
    // Adapter.setInterstitialAd("enable_detail_interstitial_ad");
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'; // mark: 122 识别手机系统
        self.setData({
          system: system,
          platform: t.platform
        });
      }
    })
    new ModalView;
  },

  // onUnload: function () {
  //   //卸载页面，清除计步器
  //   clearInterval(this.data.durationIntval);
  //   if (rewardedVideoAd && rewardedVideoAd.destroy) {
  //     rewardedVideoAd.destroy()   //退出页面时干掉视频广告
  //   }
  //   innerAudioContext.destroy()   //关闭页面音乐
  //   // ctx = null;


  // },

  // mark: 展示点赞
  showLikeImg: function () {
    var self = this;
    
    // var flag = false;
    var _likes = self.data.detail.postLikers; // mark: 142 获取点赞头像链接
    if (_likes.length==0) {
      return;
    }
    // var likes = [];
    // for (var i = 0; i < _likes.length; i++) {
      // var avatarUrl = "../../images/gravatar.png";
      // console.log(_likes[i].likerAvatUrl)
      // self.checkImgExists(_likes[i].likerAvatUrl).then(()=>{
      //   // likes[i] = avatarUrl;
      // }).catch((err)=>{
      //   console.log(err)
      //   console.log("失效图片")
      //   // _likes[i].likerAvatUrl=avatarUrl;
      // })
      // if (_likes[i].likerAvatUrl.indexOf('wx.qlogo.cn') == -1) { //头像链接含有wx.qlogo.cn就执行以下
      //   avatarUrl = _likes[i].avatarUrl; // mark: 如果在这个域名里包含wx.qlogo.cn，设置头像为此链接头像
      // }
       
    // }
    // var temp = likes;
    // console.log(_likes)
    self.setData({
      likeList: _likes //将处理后的头像链接数组赋值到本地
    });
  },
  //检测头像链接是否有效
  checkImgExists: function (imgurl) {
    return new Promise(function(resolve, reject) {
      var ImgObj = new Image();
      ImgObj.src = imgurl;
      ImgObj.onload = function(res) {
        console.log(res)
        resolve(res)
      }
      ImgObj.onerror = function(err) {
        console.log(err)
        reject(err)
      }
    })
},

  // mark: 上拉触底事件，加载评论
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      console.log('当前评论页' + self.data.page);
      self.fetchCommentData();
      self.setData({
        page: self.data.page + 1,
      });
    } else {

      wx.showToast({
        title: '加载完毕 🎉',
        mask: false,
        duration: 1666
      });
      console.log('最后一页评论');
    }

  },

  // 首次加载评论，点击帖子时调用
  fristOpenComment() {
    this.setData({
      page: 1, //评论进行分页处理
      commentsList: [],
      isLastPage: false
    })

    this.fetchCommentData(); //调用内部函数

    this.setData({
      page: this.data.page + 1, //给onReachBottom设置第二页，下拉刷新才可以保证不是第一页的评论
    });
  },

  onShareAppMessage: function (res) {
    this.ShowHideMenu();
    console.log(res);
    return {
      title: '分享"' + webSiteName + '"的帖子：' + this.data.detail.title.rendered,
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
  onShareTimeline: function () {
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
    } else {
      self.copyLink(self.data.link);
    }

  },
  // mark: 235 将复制到的链接写入剪切板并提示用户
  copyLink: function (url) {
    wx.setClipboardData({
      data: url, //设置数据到剪切板数据data
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

  // mark: 点赞
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
              success: function () {}
            })
          } else if (response.data.status == '501') {
            console.log(response.data.message);
            wx.showToast({
              title: '谢谢，已赞过',
              icon: 'success',
              duration: 900,
              success: function () {}
            })
          } else {
            console.log(response.data.message);

          }
          self.setData({
            likeImag: "like-on.png"
          });
        })
    } else {
      Auth.checkSession(self, 'isLoginNow'); //点赞未登录,请求登录

    }
  },

  // mark: 判断当前用户是否点赞
  getIslike: function () {
    var self = this;
    if (self.data.openid) { //验证是否登录
      var data = {
        openid: self.data.openid, //猜测这个应该是微信后台的
        postid: self.data.postID //帖子ID
      };
      var url = Api.postIsLikeUrl();
      var postIsLikeRequest = wxRequest.postRequest(url, data);
      postIsLikeRequest
        .then(response => {
          if (response.data.status == '200') { //查询到当前用户已经点赞，才会返回状态码200
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
    var praiseWord = self.data.detail.praiseWord;
    if (enterpriseMinapp == "1" && system == 'Android') { //如果是企业minapp==‘1‘并且系统为Android
      if (self.data.openid) { //如果用户已经登录
        wx.navigateTo({
          //直接去打赏页面
          url: '../pay/pay?flag=1&openid=' + self.data.openid + '&postid=' + self.data.postID + '&praiseWord=' + praiseWord
        })
      } else { //否则：去登录页面
        Auth.checkSession(self, 'isLoginNow'); //打赏未登录，请求登录
      }
    } else if (enterpriseMinapp == "0" || system == 'iOS') { //你手机是IOS或者企业minapp==‘0‘，满足一项即可

      var src = wx.getStorageSync('zanImageurl');
      wx.previewImage({ // 直接弹出打赏二维码
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

  // mark: --------- 待优化 ---------
  // 用户身份展示
  identityShow: function(user){
    switch (user.role) {
      case '0':
        user.role = "小可爱";
        // console.log("小可爱");
        break;
      case '1':
        // console.log("管理员");
        user.role = "管理员";
        break;
      case '2':
        // console.log("老师");
        user.role = "老师";
        break;
      case '9':
        // console.log("铸鼎_");
        user.role = "铸鼎_";
        break;

      default: //上述条件都不满足时，默认执行的代码
      user.role = "游客";
        console.log("游客");
    };
  },

  // mark: 根据帖子ID获取帖子内容
  fetchDetailData: function (id) {
    console.log("当前页面：" + id); //打印测试
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));

    var _displayLike = 'block';
    getPostDetailRequest
      .then(response => {
        // var res = response;

        // console.log(res);

        // 设置页面标题：帖子分类
        // if (res.data.categoryId) //"categoryId": "WordPress",   // mark: 405 （微信页面标签）
        // {
        //   wx.setNavigationBarTitle({
        //     // title: res.data.title.rendered
        //     title: res.data.title //res.data.categoryId    // mark: 页面标签 
        //   });
        // }

        //获取多少条评论
        // if (response.data.totalComments != null && response.data.totalComments != '') {
        //   self.setData({
        //     commentCount: response.data.totalComments // mark: 416 设置一共多少条评论
        //   });
        // };
        var resData = response.data.data;
        //设置身份信息
        var aut = resData.author;
        // self.identityShow(aut);

        //获取LocalStorage数据，将权限数改为名称
        var roleInfo=wx.getStorageSync('userLevel');
        aut.role=roleInfo.levelName;

        // console.log(resData)
        let postdate = resData.date;
        var cutdate = util.cutstr(postdate, 10, 1)
        var _likeCount = resData.likeCount; // mark: 419 喜欢计数
        // if (resData.likeCount != '0') { //如果喜欢不为0，设置样式
        //   _displayLike = "block"
        // }

        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || []; //从前到后执行，ture时就会执行，false继续往后，直到执行成功返回结果
        // 过滤重复值，如果里面有重复的帖子ID直接过滤掉 // mark: 426 去除重复ID的帖子
        if (logs.length > 0) {
          logs = logs.filter(function (log) {
            return log[0] !== id; //id是传过来的帖子ID
          });
        }
        // 如果超过指定数量
        if (logs.length > 66) { //最多存放66个元素
          logs.pop(); //去除最后一个
        }

        var aut=resData.author;
        logs.unshift({
          id: id,
          title: resData.title,
          userId: aut.id,
          wxName: aut.wxName,
          date: resData.date
          
        }); //加上现在获取到的[id,标题]
        wx.setStorageSync('readLogs', logs); //将这个数组覆盖掉

        var imageList = [];

        for (let i = 0; i < 9; i++) {
          // if(!(resData["postImage"+i].indexOf("http")==0 || resData["postImage"+i].indexOf("../")==0)){
          let fileName = resData["postImage" + i];
          if (fileName == '../../images/error.jpg' || fileName == undefined || fileName == '' || fileName == null) continue;

          //拼接下载链接
          let url = Api.imagesDownLoad(cutdate, fileName);
          // console.log(fileName)
          imageList.push(url);

          // }else{
          // let url=resData["postImage"+i];
          // imageList.push(url);
          // }

        }


        // console.log(imageList);

        // var openAdLogs = wx.getStorageSync('openAdLogs') || [];
        // var openAded = res.data.excitationAd == '1' ? false : true;
        // if (openAdLogs.length > 19) {   //大于19开启广告
        //   openAded = false; // mark: 442 去除设置广告，设置为false（不显示广告）
        // } else if (openAdLogs.length > 0 && res.data.excitationAd == '1') {    // mark: 443 是否开启广告日志 1 开启
        //   for (var i = 0; i < openAdLogs.length; i++) {
        //     if (openAdLogs[i].id == res.data.id) {  //一个帖子包含一个广告，如果找到设置的openAdLogs[i].id == res.data.id那就会设置这条广告
        //       openAded = false;    // mark: 446 去除设置广告，设置为false（不显示广告）
        //       break;
        //     }


        //   }
        // }

        // if (res.data.excitationAd == '1') {   // 1代表： 一篇帖子设置了激励广告
        //   self.loadInterstitialAd(res.data.rewardedVideoAdId);     // mark: 455 设置视频广告rewardedVideoAdId
        // }

        self.setData({
          detail: resData, //设置帖子所有信息
          authorInfo: aut, //用户名片信息
          imagesList: imageList, //9图图片链接列表
          authorID: resData.author.id, //文章作者ID
          likeCount: _likeCount, //设置点赞数
          postID: resData.id, //设置帖子Id
          cutDate: cutdate,   //剪切时间年-月-日
          detailDate: postdate, //帖子的发布时间
          display: 'block', //显示帖子
          displayLike: _displayLike, //如果有喜欢数，把喜欢数设置出显示效果
          // totalComments: response.data.totalComments, //设置评论总数
          // postImageUrl: response.data.postImageUrl,     //设置帖子主题图片（无效数据）
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
      //   // mark: 489 设置帖子标签
      //   var tagsArr = [];
      //   tagsArr = res.data.tags   //此处的帖子标签是一个数组
      //   if (!tagsArr) {
      //     return false;
      //   }
      //   var tags = "";
      //   for (var i = 0; i < tagsArr.length; i++) {  //本帖子有tags就设置tags
      //     if (i == 0) {
      //       tags += tagsArr[i];
      //     }
      //     else {
      //       tags += "," + tagsArr[i];
      //     }
      //   }
      //   if (tags != "") {
      //     // mark: 505 通过tages获取帖子列表
      //     var getPostTagsRequest = wxRequest.getRequest(Api.getPostsByTags(id, tags));
      //     getPostTagsRequest
      //       .then(response => {
      //         self.setData({
      //           postList: response.data    // mark: 510 获取到帖子列表
      //         });
      //       })
      //   }
      // })


      .then(response => { //获取点赞记录
        self.showLikeImg(); // mark: 519 调用点赞用户头像列表
      }).then(resonse => {
        if (self.data.openid) { //openID 微信用户唯一标识，此处的if验证是否登录
          Auth.checkSession(self, 'isLoginLater'); //'isLoginNow'==flag才弹出登录框，这个不提示弹出登录框
        }
      }).then(response => { //获取是否已经点赞
        if (self.data.openid) {
          self.getIslike();
        }
      }).then(response => {
        self.fristOpenComment(); //加载详情页面首次加载评论
      })
      .catch(function (error) {
        console.log('error: ' + error);
      })
  },
  //////////////////////////


  // 作者信息展示
  authorShow: function (v) {

    // console.log(v)
    var wxID= v.currentTarget.dataset.ainfo.wxId;
    this.setData({
      wxId: wxID,
      showAuthorCard: true
    })
  },
  // 用户信息展示
  userShow: function (v){

    console.log(v);

    var self =this;

    var liker = v.target.dataset.info;
        self.identityShow(liker);

    this.setData({
      wxId: liker.wxId,
      likerInfo: liker,
      showUserCard: true
    })
  },

  // 点击名片确认复制微信号
  copyWxId() {

    var self=this;

    wx.setClipboardData({
      data: self.data.wxId,
      success(res) {
        // console.log("复制到剪切板："+res);
        // wx.getClipboardData({
        //   success: (option) => {
        //     console.log("获取剪切板信息："+option);
        //   },
        // })
      },
      fail() {

      }
    })
  },


  // mark: 图片预览
  clickImage: function (e) {

    // console.log(e)


    var current = e.target.dataset.src;
    // console.log(current)
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.imagesList // 需要预览的图片http链接列表
    })
    // console.log(this.data.imagesList)

  },

  //拖动进度条事件
  sliderChange: function (e) {
    var that = this;
    innerAudioContext.src = this.data.detail.audios[0].src;
    //获取进度条百分比
    var value = e.detail.value;
    this.setData({
      audioTime: value
    });
    var duration = this.data.audioDuration;
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    //更改状态
    this.setData({
      audioSeek: value,
      isPlayAudio: true
    });
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    //播放歌曲
    innerAudioContext.play();
  },


  //初始化播放器，获取duration
  InitializationAudio: function (audiosrc) {
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
      setTimeout(function () {
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

  loadAudio: function () {
    var that = this;
    //设置一个计步器
    that.data.durationIntval = setInterval(function () {
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

  playAudio: function () {
    //获取播放状态和当前播放时间  
    var self = this;
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

  //给a标签添加跳转和复制链接事件 // mark: 678 解析帖子内容的a标签 只有wxml内部属性bindlinktap="wxParseTagATap" 调用
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

    if (redirectype) {
      // if (redirectype == 'apppage') { //跳转到小程序内部页面         
      //   wx.navigateTo({
      //     url: path
      //   })
      // } else if (redirectype == 'webpage') //跳转到web-view内嵌的页面
      // {
      href = '../webpage/webpage?url=' + href; // // mark: 707 只要是定义了a标签定义了redirectype，就会跳转到网页处理页面
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


    var enterpriseMinapp = self.data.detail.enterpriseMinapp; //帖子中的enterpriseMinapp字段是1就是本博客企业小程序

    //可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) { //如果域名不含有本站后端域名，比如0.0.0.0：80

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
      self.copyLink(href); //即不属于minapp也不属于设置的包含域名  // mark: 752 修改成如果不是本站后端域名直接复制到剪切板

      // }

    } else { //如果含有本站后端域名，比如0.0.0.0：80   // mark: 757 获取a标签中链接的末端的文件名
      var slug = util.GetUrlFileName(href, domain); // 得到链接末尾文件的文件名,如果域名结尾包含 // mark: 759 得到链接末尾文件的文件名
      if (slug == "") //不是本站域名也不是文件
      {
        // var url = '../webpage/webpage'
        // // if (enterpriseMinapp == "1") {
        //   url = '../webpage/webpage';
        //   wx.navigateTo({
        //     url: url + '?url=' + href
        //   })
        // }
        // else {
        self.copyLink(href); //复制到剪切板并提醒
        // }
        return;

      }
      if (slug == 'index') { //a链接是本站后端域名或者未定义地址
        wx.switchTab({
          url: '../index/index'
        })
      } else { // mark: 780 a链接是本站后端域名且包含本站帖子地址
        ///////获取帖子通过slug
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
                } else {
                  wx.navigateTo({
                    url: '../detail/detail?id=' + postID
                  })
                  openLinkCount++;
                  wx.setStorageSync('openLinkCount', openLinkCount);
                }
              } else { //本站帖子不存在

                var url = '../webpage/webpage'
                if (enterpriseMinapp == "1") { //如果是帖子不存在且是本程序企业APP帖子直接跳转
                  url = '../webpage/webpage';
                  wx.navigateTo({
                    url: url + '?url=' + href
                  })
                } else {
                  self.copyLink(href); //普通帖子不存在，直接复制
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
    // var aPageReply = replyCount;    //判断评论分页有没有更多
    args.postId = self.data.postID;
    // args.limit = pageCount;   //评论加载每页多少条
    args.page = self.data.page; //评论页第几页

    self.setData({
      isLoading: true
    })
    var authJwt = wx.getStorageSync('authorization');
    var getCommentsRequest = wxRequest.getRequest(Api.getCommentsReplay(args), '', authJwt); // mark: API处获取评论列表

    // console.log(auth);
    // console.log(getCommentsRequest.httpInfo);
    // Object.defineProperties(getCommentsRequest.httpInfo.header,'header',{
    //   'Content-Type': 'application/json',
    //   'Authorization': auth

    // });
    // getCommentsRequest.httpInfo.header.Authorization=wx.getStorageSync('Authorization');

    getCommentsRequest
      .then(response => {
        var dataAll = response.data; //整块数据


        if (dataAll.code == 200) {
          var pageCount = dataAll.data.pages; //页面总数
          var totalComments = dataAll.data.total; //总评论数

          // var setLength = dataAll.data.size; //后端设置每页多少评论

          var resFatherList = dataAll.data.records;
          var resFatherFirstSonLen = resFatherList[0].sonList.length;

          var currentPageNum = dataAll.data.current;

          var localComments = self.data.commentsList;

          self.setData({
            commentCount: totalComments
          });


          // var sum = 0;    //计算每页子评论之和

          // resFatherList.forEach(
          //   //index:数组元素索引 value:数组元素值 array：数组本身
          //   function (value, index, array) {

          //     sum = sum + value.sonList.length;
          //   });


          if (currentPageNum >= pageCount) {
            self.setData({
              isLastPage: true
            });
          }


          if (resFatherFirstSonLen !== 0 && localComments.length !== 0) {
            var locaList = localComments;

            // 评论列表的合成（选出本地最后一个 和响应列表第一个）
            if (locaList.slice(-1)[0] && resFatherList[0]) {
              var locaListLast = locaList.slice(-1)[0]; //选出本地列表最后一个元素
              var resListFirst = resFatherList.slice(0, 1)[0]; //选出响应列表第一个元素



              if (locaListLast.id === resListFirst.id) {
                var unionSon = resFatherList.shift().sonList; //返回削去response子第一个父评论的子列表

                // console.log(unionSon);

                var locaLastSon = locaListLast.sonList.concat(unionSon);

                // console.log(locaLastSon);
                // console.log(locaList);

                locaList[locaList.length - 1].sonList = locaLastSon;
              }

            }

            // console.log(locaList)
            // console.log(resFatherList)

            self.setData({
              commentsList: localComments.concat(resFatherList)
            });

          } else {

            self.setData({
              commentsList: localComments.concat(resFatherList)
            });
          }

        }
        // console.log(localComments)
      })
      .catch(response => {
        console.log(response); //上面的语句执行失败才会执行这个

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
  // loadMore: function (e) {
  //   var self = this;
  //   if (!self.data.isLastPage) {
  //     self.setData({
  //       page: self.data.page + 1
  //     });
  //     console.log('当前页' + self.data.page);
  //     this.fetchCommentData();
  //   } else {
  //     wx.showToast({
  //       title: '没有更多内容',
  //       mask: false,
  //       duration: 1000
  //     });
  //   }
  // },


  // mark: 点击评论获取需要回复的目标信息------(子评论信息)
  replay: function (e) {
    var self = this;

    var id = e.currentTarget.dataset.id; //父级评论ID *（子回复需要）

    console.log("#########点击replay#########");
    console.log("父级评论ID[replay:parentID]：" + id); //打印测试

    var name = e.currentTarget.dataset.name;
    var receiveUserid = e.currentTarget.dataset.userid; //接收用户ID  *
    console.log("接收消息用户ID：[replay:receiveUserid]" + receiveUserid); //打印测试
    // isFocusing = true;
    if (self.data.enableComment == "1") {
      self.setData({
        parentID: id,
        placeholder: "回复" + name + ":",
        focus: true,

        receiveUserid: receiveUserid, //*
        isFatherReply: false //*
      });

      console.log("是否评论的父级：" + self.data.isFatherReply); //打印测试

    }

  },

  //长按评论触发删除
  longPressComment:function(e){
     var self=this;
    // console.log(e)
    var longPresSet=e.target.dataset;
    let myInfo = wx.getStorageSync('userInfo');
    //判断是不是自己的评论，如果是才可以进行执行删除
    if(myInfo.userId===longPresSet.userid){
      // console.log("执行删除评论～～～")
      Dialog.confirm({
        title: '确认删除此评论？',
        message: longPresSet.content,
      }).then(() => {
        // on confirm
        
        let replyId=longPresSet.id;    //父级表评论的ID或子级表评论的ID
        let from=longPresSet.commentType;    //false来自父级评论，true来自子级评论

        //如果是子评论就将评论ID换成子评论的ID
        if(from){
          replyId=longPresSet.sid;
        }
        // console.log(myInfo)

        var data={
          userId: myInfo.userId,
          replyId: replyId,
          from: longPresSet.commentType,
          
        };

        // console.log(myInfo.userId)

        var url = Api.delMyComment();
        var authJwt=wx.getStorageSync('authorization');

        var delComment =  wxRequest.deleteRequest(url, data, authJwt);

        delComment.then(res => {
          console.log(res);
          
          if(res.data.code==200){
            
            wx.showToast({  //评论成功，下拉看看吧
              title: res.data.msg,
              mask: true,
              icon: "none",
              duration: 3000
            });

            self.fristOpenComment(); //刷新评论列表
          }
          
        })


      })
      .catch(() => {
        // on cancel
      });

    }

  },

  //输入框得到焦点（不设置信息）
  onRepleyFocus: function (e) {
    var self = this;
    console.log("#########输入框得到焦点#########");
    var postid = self.data.postID; //子父评论共有信息
    var author = self.data.authorID;

    console.log("帖子ID（）：" + postid +
      "\n贴子作者ID：" + author); //本帖ID和作者ID
    //子需要postid
    //父级需要postid和author

    console.log("被回复用户ID（非作者）receiveUserid：" + self.data.receiveUserid);

    console.log("评论的是否为父级：" + self.data.isFatherReply); //打印测试

    console.log("父级ID：" + self.data.parentID); //子回复需要
    // isFocusing = true;
    if (!self.data.focus) {
      self.setData({
        focus: true //输入框获取焦点
      })
    }
  },
  //输入框失去焦点（父评论信息）
  onReplyBlur: function (e) {
    console.log("#########输入框失去焦点#########")
    var self = this;

    const text = e.detail.value.trim();
    if (text === '') {
      self.setData({
        placeholder: "回复此墙帖",
      });
    }


  },

  //回复父级评论按钮
  commentPage: function () {
    var self = this;
    var receiver = self.data.authorID;
    console.log("###点击了父级评论按钮###");
    self.setData({
      isFatherReply: true,
      receiveUserid: receiver,

    });

    console.log("接收消息用户ID " + receiver) //打印测试 
    console.log("评论的是否为父级：" + self.data.isFatherReply); //打印测试

  },

  // mark:提交评论 
  formSubmit: function (e) {
    var self = this;

    // var postID = e.detail.value.inputPostID; //帖子的ID
    var postID = self.data.postID;
    var author = self.data.authorID;

    var parentReplyID = self.data.parentID; //被回复父级评论ID

    var comment = e.detail.value.inputComment; //评论内容

    var receiveUserID = self.data.receiveUserid; //接收消息用户ID

    var fatherReply = self.data.isFatherReply; //是否是父级评论

    if (comment.length === 0) {
      self.setData({
        'dialog.hidden': false,
        'dialog.title': '提示',
        'dialog.content': '没有填写评论内容。'

      });
    } else {
      if (self.data.openid) { //如果登陆了
        // var name = self.data.userInfo.nickName;   //登录用户网名
        // var author_url = self.data.userInfo.avatarUrl;     //登录用户头像
        // var email = self.data.openid + "@qq.com";   //登录用户邮箱
        // var openid = self.data.openid; //登录用户身份唯一标识


        var data = {
          postID: postID,
          authorID: author,

          parentID: parentReplyID, //父级ID（0是评论文章）（不是0就是父级评论的ID）

          //登录用户
          // openID: openid,
          // userID: userid,

          content: comment,

          //被评论的用户
          receiverID: receiveUserID,
          isFatherReply: fatherReply
          //判断是不是本文章作者
        };
        var url = Api.postWeixinComment(); //获取评论提交接口
        var authJwt = wx.getStorageSync('authorization');
        var postCommentRequest = wxRequest.postRequest(url, data, authJwt);
        // var postCommentMessage = "";
        postCommentRequest
          .then(res => {
            // console.log(res)
            // var code = res.data.code;
            if (res.data.code == '200') {

              self.setData({
                content: '',
                parentID: "0",
                receiveUserid: 0,
                placeholder: "回复此墙帖",
                focus: false,
                commentsList: []

              });

              wx.showToast({  //评论成功，下拉看看吧
                title: res.data.msg,
                mask: false,
                icon: "none",
                duration: 3000
              });
              // postCommentMessage = res.data.message;
              // var commentCounts = parseInt(self.data.totalComments) + 1;
              // self.setData({
              //   totalComments: commentCounts,
              //   commentCount: "有" + commentCounts + "条评论"

              // });

            } else { //登录但是是匿名评论 

              if (res.data.code == 'rest_comment_login_required') {
                wx.showToast({
                  title: '需要开启在WordPress rest api 的匿名评论功能！',
                  icon: 'none',
                  duration: 3000,
                  success: function () {}
                })


              } else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                wx.showToast({
                  title: 'email填写错误！',
                  icon: 'none',
                  duration: 3000,
                  success: function () {}
                })

              } else if (res.data.code == '87014') {
                wx.showToast({
                  title: '内容含有违法违规内容!',
                  icon: 'none',
                  duration: 3000,
                  success: function () {}
                })

              } else {
                console.log(res)
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 3000,
                  success: function () {}
                })
              }
            }

            return res;
          }).then(res => {

            // console.log(res);
            if (res.data.code == '200' && res.data.data == true) {

              self.fristOpenComment(); //刷新评论列表
            }

          }).catch(response => {
            console.log(response)
            wx.showToast({
              title: '评论失败:' + response,
              icon: 'none',
              duration: 3000,
              success: function () {}
            })
          })
      } else { //检测未登录，请求登录
        Auth.checkSession(self, 'isLoginNow'); //评论未登录，请求登录

      }

    }

  },

  // mark: 点击登录
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');    //加载Auth.agreeGetUser(e, wxLoginInfo, authFlag)

  },
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    this.showModal(detail);
  },
  onPosterFail(err) {
    wx.showToast({
      title: '生成海报失败',
      mask: true,
      duration: 2000
    });
  },

  onCreatePoster: function () { //创建帖子海报
    var self = this;
    this.ShowHideMenu();
    if (self.data.openid) {
      self.creatArticlePoster(self, Api, util, self.modalView, Poster);
    } else {
      Auth.checkSession(self, 'isLoginNow'); //创建海报未登录，请求登录

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

  onLoadQr(e) {
    var self=this;
    
    console.info('二维码加载成功~~,文件地址:', e.detail)

    this.setData({
      qrImage: e.detail
    });
  },

  // mark: 1182 创建帖子海报
  creatArticlePoster: function (appPage, api, util, modalView, poster) {
    // var self=this;

    console.log(appPage.data.detail);

    var postId = appPage.data.detail.id;
    var title = appPage.data.detail.title;
    var cutdate = appPage.data.cutDate;
    var excerpt = "excerpt";
    var postImageUrl = ""; //海报图片地址
    // var posterImagePath = "";
    var qrcodeImagePath = ""; //二维码图片的地址
    // var flag = false;
    var imageInlocalFlag = false;
    // var downloadFileDomain = appPage.data.downloadFileDomain;   //图片下载主机列表
    // var logo = appPage.data.logo;
    var defaultErrorImage="../../../../images/error.jpg";
    var defaultPostImageUrl = appPage.data.detail.postImage0;   //帖子上传第一个图
    let image0url = Api.imagesDownLoad(cutdate, defaultPostImageUrl);   //帖子上传第一张图的URL
    // var postImageUrl = appPage.data.detail.post_full_image;   //页面首图（海报封面）
    


    //获取帖子首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
    if (defaultPostImageUrl=="../../images/error.jpg" ) {
      // var n = 0;
      // for (var i = 0; i < downloadFileDomain.length; i++) {

      //   if (postImageUrl.indexOf(downloadFileDomain[i]) != -1) {
      //     n++;
      //     break;
      //   }
      // }
      // if (n == 0) {
        //没有设置封面图
        // imageInlocalFlag = true;
        postImageUrl = defaultErrorImage;

      // }

    } else {  
      //有封面图
      postImageUrl = image0url;
    }

    if (!postImageUrl) {  //帖子未上传任何图片

      wx.showToast({
        title: '墙贴没有图片且插件未设置默认海报封面图',
        icon: 'none',
        duration: 3000,
        success: function () {}
      })
      return;

    }
    var posterConfig = {    //背板
      width: 750,
      height: 1200,
      backgroundColor: '#fff',
      debug: false

    }
    var blocks = [{
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
    texts = [{
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
        text: '发现不错的帖子推荐给你',
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


    posterConfig.blocks = blocks; //海报内图片的外框
    posterConfig.texts = texts; //海报的文字
    // var url = Api.creatPoster();
    var path = "pages/detail/detail?id=" + postId;
    // var data = {
    //   postid: postId,
    //   path: path

    appPage.setData({
      qrTxt: path
    });

    // };
    // var creatPosterRequest = wxRequest.postRequest(url, data);
    // creatPosterRequest.then(res => {

    console.log(appPage.data.qrImage)
      
      if (appPage.data.qrImage!='') {
        qrcodeImagePath = appPage.data.qrImage;


        var images = [{
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
            url: postImageUrl, //海报主图
          },
          {
            width: 220,
            height: 220,
            x: 92,
            y: 1020,
            url: qrcodeImagePath, //二维码的图
          }
        ];

        posterConfig.images = images; //海报内的图片

        console.log(posterConfig)
        appPage.setData({
          posterConfig: posterConfig
        }, () => {
          poster.create(true); //生成海报图片
        });

      } else {
        wx.showToast({
          title: '加载失败',
          mask: true,
          duration: 2000
        });
      }
    // });
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

  //       var id = self.data.detail.id;   //本帖子的ID
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
  //             "id": id,   //为某些帖子ID设置广告
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