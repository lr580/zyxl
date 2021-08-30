// miniprogram/pages/TreeHole/TreeHole.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [], //类别(注意5是全部)
    type_seq: [5, 0, 1, 2, 3, 4],  //类别顺序
    now_type: 5, //当前类别下标
    sort_key: 0,//当下版本只有0，按最后活跃时间排序
    sort_reverse: false,//是否从远到近
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init_postindex();
  },

  //页面初始化
  init_postindex: function () {
    this.setData({
      types: km.globalData.type_p,
    });
  },

  //选择类别
  sele_type: function (e) {
    this.setData({
      now_type: Number(e.currentTarget.id),
    });
  },

  //选择排序是否逆序
  sele_sortreverse:function(e){
    this.setData({
      sort_reverse: Number(e.currentTarget.id),
    });
  },

  //前往发帖
  goto_postp: function () {
    wx.navigateTo({
      url: '../postp/postp',
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