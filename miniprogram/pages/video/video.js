// pages/video/video.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choice_showing: false, //是否显示互动选项
    video_src: "cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/video/test0-0.mp4",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //视频加载失败时执行
  video_error: function (e) {
    console.log('QwQ', e);
  },

  //弹出互动选项
  show_choice: function () {
    this.setData({
      choice_showing: true
    });
  },

  //隐藏互动选项
  hide_choice: function () {
    this.setData({
      choice_showing: false
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