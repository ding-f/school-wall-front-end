// pages/publish/publish.js
var wxRequest = require('../../utils/wxRequest.js')
var Api = require('../../utils/api.js');
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
// import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

var Auth = require('../../utils/auth.js'); //登录模块
var app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {

    openid: "", //用户身份ID（登录用户身份ID）
    userid: 0, //登录用户ID
    userInfo: {}, //用户信息
    userLevel: {},

    title: '',
    content: '',
    selectedCate: {
      id: 1,
      name: "校园生活",
      subname: "爱校园，爱生活~"
    },
    pictureList: [],
    upNameArr: [],

    categoriesList: [{
        name: '访问错误，请联系开发者。',
        color: '#ee0a24'
      },
      {
        loading: true
      },

    ],
    showCateSheet: false,
    arrowDirection: "left",

    isLoginPopup: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    Auth.setUserInfoData(self); //给当前页设置用户信息，没有就说明么有登录
    Auth.checkLogin(self); //检查微信服务器session_key是否有效，session无效||code丢失 重新设置code信息

    var getAddPostCateList = wxRequest.getRequest(Api.getAddPostCateList());
    getAddPostCateList.then(response => {
      var listCate = response.data.data;

      //[JS高效更改对象中属性名](https://blog.csdn.net/corey_mengxiaodong/article/details/80238615)
      listCate = JSON.parse(JSON.stringify(listCate).replace(/description/g, "subname"));
      // console.log(listCate)
      if (response.data.code === 200) {
        this.setData({
          categoriesList: listCate
        });
      } else {
        // this.setData({
        //   categoriesList: [
        //     { name: '访问错误', color: '#ee0a24' },
        //     { loading: true },

        //   ]
        // });
      }

      // console.log(listCate)
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let self = this;
    Auth.checkSession(self, 'isLoginNow'); //弹出LoginPopup，显示用户信息

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);

  },

  //选择图片数据组合
  before: function (e) {
    // console.log("**************");
    //js数据
    var imageList = this.data.pictureList;
    // console.log(e.detail.file);
    //页面数据
    var fileList = e.detail.file;
    this.setData({
      pictureList: imageList.concat(
        fileList.map(function (image) {


          // console.log(image)
          return image;
        })
      )
    });

  },

  //点击删除图片
  delOne: function (e) {

    function RemoveValueByIndex(arr, index) {
      arr.splice(index, 1);
      return arr;
    }

    var delIndex = e.detail.index;
    // console.log(delIndex);
    var imageList = this.data.pictureList;

    var deledList = RemoveValueByIndex(imageList, delIndex);

    this.setData({
      pictureList: deledList

    })

  },

  //有赞Vant组件Bug fterRead事件不能触发（Vant未修复Bug）
  afterRead: function (e) {
    // const { file } = e.detail;

    console.log("--------------------")
    console.log(e)
    // console.log(...file)
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    // wx.uploadFile({
    //   url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
    //   filePath: file.url,
    //   name: 'file',
    //   formData: { user: 'test' },
    //   success(res) {
    // 上传完成需要更新 fileList
    // const { pictureList = [] } = this.data;
    // pictureList.push({ ...file });
    // this.setData({ pictureList });
  },


  // mark: 发布按钮点击事件 
  formSubmit: function (e) {
    let self = this;
    var postTitle = e.detail.value.post_title;
    var postContent = e.detail.value.post_content;
    var cateObj = self.data.selectedCate;
    var authJwt = wx.getStorageSync('authorization');
    //提交内容
    var selectedPhotoList = self.data.pictureList;

    var upNameList = self.data.upNameArr;



    if (postTitle === null || postTitle === "") {
      Notify('发布墙贴一定要加上标题哦');
      return
    }
    // console.log("检测标题继续执行")
    if (postContent === null || postContent === "") {
      Notify('发布墙贴一定要填入内容哦');
      return
    }


    const beforeClose = (action) => new Promise((resolve) => {
      setTimeout(() => {
        if (action === 'confirm') {
          resolve(true);

          //文件服务器链接
          var addImageUrl = Api.postAdd();
          // let dataTrans={}

          var arr = [];
          selectedPhotoList.map(function (v, k) {

            wx.uploadFile({
              //后端提交文件接口
              url: addImageUrl,
              //请求体form-data，key=file
              name: 'file',
              //本地资源路径
              filePath: v.url,
              // 请求头token 
              formData: {
                Authorization: authJwt
              },
              success(res) {
                let img = res.data;
                // console.log(img)
                arr.push(img.toString()); //返回图片的路径  并追加到新数组里面
              },
              fail(err) {

              },
              complete(res) {

              }

            })

          })

          this.setData({
            upNameArr: arr //在这里重新赋值
          });

          setTimeout(function () {
            let postData = {
              title: postTitle,
              content: postContent,
              categoryId: cateObj.id,
              postImage0: arr[0],
              postImage1: arr[1],
              postImage2: arr[2],
              postImage3: arr[3],
              postImage4: arr[4],
              postImage5: arr[5],
              postImage6: arr[6],
              postImage7: arr[7],
              postImage8: arr[8]

              // photoList : arr
            };

            let addurl = Api.postAddPost();
            var postAddRequest = wxRequest.postRequest(addurl, postData, authJwt);

            postAddRequest.then(res => {
              console.log(res)

            });
            wx.reLaunch({
              url: '../index/index',
            })

          }, 1000); //等待9秒后文件服务器才能返回全部图片名称，再等待1秒写入信息到数据库,并返回主页


        } else {

          // 拦截取消操作
          resolve(false);

        }
      }, 9000); //图片上传给9秒时间
    });
    var openId = wx.getStorageSync('openid');
    // console.log(openId)
    if (openId != null && openId != "") {
      Dialog.confirm({
        title: '墙贴即将发布',
        message: '墙君将刻出你的文案，渲染美丽的图片，等待10秒 ？',

        confirmButtonText: "确认发布",

        closeOnClickOverlay: true,
        showCancelButton: false,
        beforeClose
      });
    }else{
      self.setData({
        isLoginPopup: true
      })
    }
    // console.log("异步测试")
  },

  closeLoginPopup() {
    //关闭登录框
    this.setData({
      isLoginPopup: false
    });
    //返回主页
    wx.reLaunch({
      url: '../index/index'
    });

  },

  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
  agreeGetUser: function (e) {
    let self = this;

    Auth.checkAgreeGetUser(e, app, self, '0');
  },

  clickCateCell() {
    this.setData({
      showCateSheet: true,
      arrowDirection: "up"
    });
  },

  //点击遮罩层关闭列表
  onClose() {
    this.setData({
      showCateSheet: false,
      arrowDirection: "left"
    });
  },

  // mark: 选择列表项触发反馈信息
  onSelect(event) {
    // console.log(event.detail);
    let self = this;
    self.setData({
      selectedCate: event.detail
    })

  },
})