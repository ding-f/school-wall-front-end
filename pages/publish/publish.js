// pages/publish/publish.js

var Api = require('../../utils/api.js');
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

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
    pictureList: [],
    upNameArr: [],

    isLoginPopup: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let self = this;
    Auth.setUserInfoData(self); //给当前页设置用户信息，没有就说明么有登录
    Auth.checkLogin(self); //检查微信服务器session_key是否有效，session无效||code丢失 重新设置code信息

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let self = this;
    Auth.checkSession(self, 'isLoginNow');  //弹出LoginPopup，显示用户信息

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

  //有赞Vant组件Bug fterRead事件不能触发
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
  // });
  // },

  //发布按钮点击事件
  formSubmit: function (e) {
    // console.log(e)
    console.info('表单提交携带数据', e.detail.value)


    //提交内容
    var postTitle = e.detail.value.post_title;
    var postContent = e.detail.value.post_content;
    var selectedPhotoList = this.data.pictureList;
    console.log("已选择文件列表：" + selectedPhotoList);

    //文件服务器链接
    var addImageUrl = Api.postAdd();
    //  console.log(addImageUrl)
    //Jwt信息
    var authJwt = wx.getStorageSync('authorization');

    //返回一个新的图片名称列表（用于上传后端服务器存到数据库）
    var arr = new Array();



    if (postTitle === null || postTitle === "") {
      Notify('发布墙贴一定要加上标题哦');
      return
    }
    // console.log("检测标题继续执行")
    if (postContent === null || postContent === "") {
      Notify('发布墙贴一定要填入内容哦');
      return
    }
    // console.log("检测内容继续执行")
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
          let img = res.data
          console.log(img)
          arr.push(img); //返回图片的路径  并追加到新数组里面

        }

      })
    })

    this.setData({
      upNameArr: arr //在这里重新赋值，用来做删除
    })

    console.log("名称数组：" + this.data.upNameArr);

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
  agreeGetUser:function(e)
  {
    let self= this;
    
    Auth.checkAgreeGetUser(e,app,self,'0');

    let openID=this.data.openid;
    let wxName=this.data.userInfo.nickName;

    console.log(e)
    console.log()

    if(openID!==""&&openID!==null){
      Toast('登录成功，欢迎:'+wxName);
    }
        
  },

})