/*
 * 
 
 */
import config from '../../utils/config.js';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');

var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js');
var app = getApp();
var webSiteName = config.getWebsiteName;
var blog = config.getBlog;


Page({

  data: {
    readLogs: [],
    myComments: [],
    topBarItems: [
      // id name selected 选中状态
      {
        id: '1',
        name: '足迹',
        selected: true
      },
      {
        id: '2',
        name: '评论',
        selected: false
      },
      {
        id: '3',
        name: '点赞',
        selected: false
      },
      {
        id: '4',
        name: '鼓励',
        selected: false
      },
      {
        id: '5',
        name: '订阅',
        selected: false
      },
      // { id: '6', name: '言论', selected: false }
    ],
    tab: '1',
    showerror: "none",
    shownodata: "none",
    showList: "block",
    showCommentList: "none",
    activeNames: ['1'],
    lock: false, //解决长按与点击Bug
    subscription: "",
    userInfo: {},
    userLevel: {},
    openid: '',
    isLoginPopup: false,
    webSiteName: webSiteName,
    blog: blog
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.fetchPostsData('1');
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);

  },

  onReady: function () {
    var self = this;
    Auth.checkSession(self, 'isLoginNow');
  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');

  },
  onShow: function () {
    this.getTabBar().init();
    var self = this;
    self.fetchPostsData('1');
    
    Auth.checkLogin(self);    //检查Code是否过期
    Auth.setUserInfoData(self); //为整个页面，setdata用户信息

    if(self.data.openid!=''){
      self.closeLoginPopup();
    }

  },

  // mark: 疑似无用代码(实现前端页面按钮刷新功能) ，下拉刷新是 onPullDownRefresh
  // refresh:function(e)
  // {
  //   var self=this;
  //   if (self.data.openid) {
  //       var args={};
  //       var userInfo=e.detail.userInfo;
  //       args.openid=self.data.openid;
  //       args.avatarUrl=userInfo.avatarUrl;
  //       args.nickname =userInfo.nickName;
  //       var url = Api.getUpdateUserInfo();        
  //       var postUpdateUserInfoRequest = wxRequest.postRequest(url, args);
  //       postUpdateUserInfoRequest.then(res => {
  //           if (res.data.status == '200') {
  //                   var userLevel= res.data.userLevel;                            
  //                   wx.setStorageSync('userInfo',userInfo);                           
  //                   wx.setStorageSync('userLevel',userLevel);                            
  //                   self.setData({userInfo:userInfo});
  //                   self.setData({userLevel:userLevel});
  //                   wx.showToast({
  //                       title: res.data.message,
  //                       icon: 'success',
  //                       duration: 900,
  //                       success: function () {
  //                       }
  //                   })   
  //           }
  //           else{               
  //               wx.showToast({
  //                   title: res.data.message,
  //                   icon: 'success',
  //                   duration: 900,
  //                   success: function () {
  //                   }
  //               })
  //           }
  //       });
  //   }
  //   else {
  //       Auth.checkSession(self,'isLoginNow');

  //   }

  // },

  // refreshlive:function()
  // {

  //   let openid= this.data.openid
  //   var getliveinfo = wxRequest.getRequest(Api.refreshliveinfo(openid));
  //   getliveinfo.then(res=>{

  //       wx.showToast({
  //           title: res.data.message,
  //           mask: false,
  //           icon: "none",
  //           duration: 3000
  //       }); 

  //   })

  // },

  exit: function (e) {

    // console.log(e)
    var isLogin = e.target.dataset.exit;

    if (isLogin) {
      Dialog.alert({
        title: '确认离开AKU校园墙？',
        message: '点击以外区域取消\n\n退出「AKU校园墙」将不会接收本小程序的任何消息以及通知。',
        theme: 'round-button',
        confirmButtonText: '还会回来的',
        closeOnClickOverlay: true
      }).then(() => {
        // on close
        Auth.logout(this); //清除本地所有登录数据
        Auth.checkLogin(this); //推翻登录流程重头来（获取Code）
        wx.reLaunch({
          url: '../readlog/readlog'
        });
      }).catch(() => {

      });
    } else {
      Auth.logout(this); //清除本地所有登录数据
      Auth.checkLogin(this); //推翻登录流程重头来（获取Code）
      
      // wx.reLaunch({
      //   url: '../readlog/readlog'
      // });

      wx.showToast({
        title: '已清除，请登录',
        icon: 'success',
        mask: false,
        duration: 1600
      });

    }

  },

  // clear:function(e)
  // {

  //   Auth.logout(this); 

  // },

  // 点击跳转至查看帖子详情
  redictDetail: function (e) {
    //解决点击长按Bug
    if (this.data.lock) {
      this.data.lock = false;
      return;
    }


    var id = e.currentTarget.id;
    var itemtype = e.currentTarget.dataset.itemtype;
    var url = "";
    if (itemtype == "1") {
      url = '../list/list?categoryID=' + id;
    } else {
      url = '../detail/detail?id=' + id;

    }

    wx.navigateTo({
      url: url
    })
  },
  //长按 点击
  longTapMyComment(v) {
    //解决点击长按Bug
    this.data.lock = true;
    // console.log("长按我的评论")
    // console.log(v)

    var set = v.currentTarget.dataset;
    Dialog.confirm({
        title: '确认删除此评论？',
        message: set.comment,
      })
      .then(() => {
        // on confirm
        let myInfo = wx.getStorageSync('userInfo');
        let replyId = set.cid; //父级表评论的ID或子级表评论的ID
        let from = set.from; //false来自父级评论，true来自子级评论

        // console.log(myInfo)

        var data = {
          userId: myInfo.userId,
          replyId: replyId,
          from: from,

        };

        // console.log(myInfo.userId)

        var url = Api.delMyComment();
        var authJwt = wx.getStorageSync('authorization');

        var delComment = wxRequest.deleteRequest(url, data, authJwt);

        delComment.then(res => {
          console.log(res);
        })


        // console.log("删除"+replyId + "来自" +from)

      })
      .catch(() => {

        // on cancel
      });
  },

  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
      topBarItems: topBarItems,
      tab: tab

    })
    if (tab !== 0) {
      this.fetchPostsData(tab);
    } else {
      this.fetchPostsData("1");
    }
  },
  onShareAppMessage: function () {
    var title = "分享我在“" + config.getWebsiteName + "浏览、评论、点赞、鼓励的帖子";
    var path = "pages/readlog/readlog";
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  fetchPostsData: function (tab) {
    self = this;
    self.setData({
      showerror: 'none',
      shownodata: 'none'
    });
    var count = 0;
    var openid = "";
    if (tab != '1') {
      if (self.data.openid) {
        var openid = self.data.openid;
      } else {
        Auth.checkSession(self, 'isLoginNow');
        return;
      }

    }
    // mark: 足迹列表
    if (tab == '1') {
      self.setData({
        // readLogs: [],
        myComments: [],
        showCommentList: "none",
      });
      var readHis = wx.getStorageSync('readLogs');
      self.setData({
        readLogs: (readHis || []).map(function (log) {
          count++;
          return log;
        })
      });
      if (count == 0) {
        self.setData({
          shownodata: 'block',
          showList: 'none',

        });
      } else {
        self.setData({
          showList: 'block',
          showCommentList: 'none',
        });
      }
    }
    // mark: 评论列表
    else if (tab == '2') {
      self.setData({
        readLogs: [],
        myComments: [],

        showList: "none",
      });
      var authJwt = wx.getStorageSync('authorization');
      var getMyCommentsPosts = wxRequest.getRequest(Api.getWeixinComment(), '', authJwt);
      getMyCommentsPosts.then(response => {
        console.log(response) // mark: xxx
        var myCommentsList = response.data.data;
        if (response.statusCode == 200) {
          self.setData({
            myComments: myCommentsList
          });
          if (myCommentsList.length == 0) {
            self.setData({
              shownodata: 'block',

              showCommentList: 'none',
            });
          } else {
            self.setData({
              showList: "none",
              showCommentList: "block"
            })
          }
        } else {
          console.log(response);
          self.setData({
            showerror: 'block'
          });

        }
      })
    }
    //点赞
    else if (tab == '3') {
      self.setData({
        readLogs: []
      });
      var getMylikePosts = wxRequest.getRequest(Api.getMyLikeUrl(openid));
      getMylikePosts.then(response => {
        if (response.statusCode == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
              count++;
              item[0] = item.post_id;
              item[1] = item.post_title;
              item[2] = "0";
              return item;
            }))
          });

          if (count == 0) {
            self.setData({
              shownodata: 'block'
            });
          } else {
            self.setData({
              showList: 'block',

            });
          }
        } else {
          console.log(response);
          self.setData({
            showerror: 'block'
          });

        }
      })

    }
    // 鼓励
    else if (tab == '4') {
      self.setData({
        readLogs: []
      });

      var getMyPraisePosts = wxRequest.getRequest(Api.getMyPraiseUrl(openid));
      getMyPraisePosts.then(response => {
        if (response.statusCode == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
              count++;
              item[0] = item.post_id;
              item[1] = item.post_title;
              item[2] = "0";
              return item;
            }))
          });
          if (count == 0) {
            self.setData({
              shownodata: 'block'
            });
          } else {
            self.setData({
              showList: 'block',

            });
          }
        } else {
          console.log(response);
          this.setData({
            showerror: 'block'
          });
        }
      })
    }
    // mark: 订阅表实现
    else if (tab == '5') {
      self.setData({
        readLogs: [],

        myComments: [],
        showList: "none",
      });
      var authJwt = wx.getStorageSync('authorization');
      var url = Api.getSubscription()
      //+ '/openid=' + openid;
      var getMysubPost = wxRequest.getRequest(url, '', authJwt);
      getMysubPost.then(response => {
        if (response.statusCode == 200) {
          var usermetaList = response.data.data;
          // console.log(usermetaList);
          if (usermetaList) {
            self.setData({
              readLogs: usermetaList
              // .filter(v=>{
              //   //剪贴显示年月日
              //   // v.date = util.cutstr(v.date, 10, 1);    //剪切字符串，为10个，1是不用加"..."
              //   count++;
              //   // 去除数组空元素

              //   return v; 
              // })
            });
            // console.log(usermetaList)
          }

          if (usermetaList.length == 0) {
            self.setData({
              shownodata: 'block',
              showList: 'none',
            });
          } else {
            self.setData({
              showList: 'block',
              showCommentList: 'none',
            });
          }
        } else {
          console.log(response);
          this.setData({
            showerror: 'block'
          });
        }
      })


    } else if (tab == '6') {
      self.setData({
        readLogs: []
      });
      var getNewComments = wxRequest.getRequest(Api.getNewComments());
      getNewComments.then(response => {
        if (response.statusCode == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.map(function (item) {
              count++;
              item[0] = item.post;
              item[1] = util.removeHTML(item.content.rendered + '(' + item.author_name + ')');
              item[2] = "0";
              return item;
            }))
          });
          if (count == 0) {
            self.setData({
              shownodata: 'block'
            });
          }

        } else {
          console.log(response);
          self.setData({
            showerror: 'block'
          });

        }
      }).catch(function () {
        console.log(response);
        self.setData({
          showerror: 'block'
        });

      })
    }
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
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  }
})