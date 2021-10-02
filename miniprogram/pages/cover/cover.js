// miniprogram/pages/cover/cover.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    already: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.init_coverpage();
    // setTimeout(
    //   function () {
    //     wx.switchTab({
    //       url: '../index/index',
    //       // url: '../Me/Me',
    //     });
    //   }, 1);
  },

  init_coverpage: function () {
    let thee = this;
    // setTimeout(() => {
    //   wx.showToast({
    //     title: '网络不佳，请点击右上角重新进入小程序。',
    //     duration: 20000,
    //     icon: 'none',
    //   });
    // }, 8000);
    wx.switchTab({
      url: '../index/index',
    });
    // return;
    // if (!thee.data.already || !km.globalData.cover_loaded) {
    //   km.coverpage_reload = function () {
    //     thee.setData({
    //       already: true,
    //     });
    //     wx.switchTab({
    //       url: '../index/index',
    //     });
    //     km.globalData.cover_loaded = true;
    //     km.indexpage_reload();
    //   };
    // } else {
    //   wx.switchTab({
    //     url: '../index/index',
    //   });
    // }
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
    this.init_coverpage();
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