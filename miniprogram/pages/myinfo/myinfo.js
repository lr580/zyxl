// pages/myinfo/myinfo.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    userinfo: '',
    i_name: '',
    i_motto: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myinfo_init();
  },

  //初始化
  myinfo_init: function () {
    this.setData({
      openid: km.globalData.openid,
      userinfo: km.globalData.info_user,
      i_name: km.globalData.info_user.name,
      i_motto: km.globalData.info_user.motto,
    });

  },

  //输入昵称
  input_name: function (e) {
    let v = e.detail.value;
    this.setData({
      i_name: v,
    });
  },

  //输入个性签名
  input_motto: function (e) {
    this.setData({
      i_motto: e.detail.value,
    });
  },

  //保存昵称和签名更改
  save_change: function () {
    let newname = this.data.i_name, newmotto = this.data.i_motto;
    if (newname.length == 0) {
      wx.showToast({
        title: '昵称不能为空！',
        icon: 'none',
        duration: 3000,
      })
      return;
    }
    wx.showLoading({
      title: '修改中……',
    })
    db.collection('user').doc(km.globalData.openid).update({
      data: {
        name: newname,
        motto: newmotto,
      }

    }).then(res => {
      km.globalData.info_user.name = newname;
      km.globalData.info_user.motto = newmotto;
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '修改成功！',
      });
    }).catch(rws => {
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '修改失败，请重试！',
        icon: 'none',
        duration: 3000,
      });
    });
  },

  //上传头像
  upload_avatar: function () {
    console.log('qwq');
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