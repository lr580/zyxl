// miniprogram/pages/Me/Me.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid: -1,
    userinfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init_userpage();
  },

  //初始化函数
  init_userpage: function () {
    this.setData({
      userid: km.globalData.userid,
      userinfo: km.globalData.info_user,
    });
  },

  //注册(首次登录)
  register: function () {
    let thee = this;
    wx.getUserProfile({
      desc: '请授权获取您的头像和昵称',
      success: (ret) => {
        thee.create_newuser(ret.userInfo.nickName, ret.userInfo.avatarUrl);
      },
      fail: (rwt) => {
        thee.create_newuser();
      },
    });
    return;
  },

  //创造新用户
  create_newuser: function (uname = '未命名用户', uavatar = 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/avatar/unknown_user.jpg') {
    var thee = this;
    wx.showLoading({
      title: '创建用户中，请稍后……',
      mask: true,
      success: (res) => { },
      fail: (res) => { },
      complete: (res) => { },
    });

    var udata = {
      _id: km.globalData.openid,
      name: uname,
      avatar: uavatar,
      motto: '',
      point: 0,
      warehouse: [],
      appointment_talk: [],
      appointment_vr: [],
      star_video: [],
      star_post: [],
      history_video: [],
      history_post: [],
      post: [],
      message: [],
    };

    db.collection('user').add({
      data: udata
    }).then(res => {
      km.globalData.info_user = udata;
      thee.setData({
        userinfo: udata,
      })
      wx.hideLoading({
        success: (res) => { },
      });
    }).catch(rws => {
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '创建失败！请重试！',
        icon: 'none',
        duration: 3000,
      });
    });
  },

  //真实永久删除账号(正式版本可能不会显示该功能)
  del_user: function () {
    let thee = this;
    wx.showLoading({
      title: '创建用户中，请稍后……',
      mask: true,
      success: (res) => { },
      fail: (res) => { },
      complete: (res) => { },
    });

    db.collection('user').doc(km.globalData.openid).remove().then(res => {
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '删除成功，重启小程序生效！请马上重启小程序(此时进行其他操作可能会产生故障)。',
        icon: 'none',
        duration: 3000,
      })
    }).catch(rws => {
      console.error('删除用户失败', rws);
      wx.hideLoading({
        success: (res) => { },
      });
    })
  },

  //前往详细信息页面
  goto_myinfo: function () {
    wx.navigateTo({
      url: '../myinfo/myinfo',
    });
  },

  //前往收藏页面
  goto_mycollect: function () {
    wx.navigateTo({
      url: '../mycollect/mycollect',
    });
  },

  //前往浏览记录页面
  goto_myhistory: function () {
    wx.navigateTo({
      url: '../myhistory/myhistory',
    });
  },

  //前往树洞页面
  goto_mypost: function () {
    wx.navigateTo({
      url: '../mypost/mypost',
    });
  },

  //前往帮助页面
  goto_help: function () {
    wx.navigateTo({
      url: '../help/help',
    });
  },

  //前往联系客服页面
  goto_contactus: function () {
    wx.navigateTo({
      url: '../contactus/contactus',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init_userpage();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})