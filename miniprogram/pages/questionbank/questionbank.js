// pages/questionbank/questionbank.js
import * as io from '../../js/common/io'
import * as problem from '../../js/base/problemCtrl'
const app = getApp();
var now_type = 1;
var startPoint;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        buttonTop: 0,
        buttonLeft: 0,
        windowHeight: '',
        windowWidth: '',
        TabCur: 0,
        scrollLeft:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that =this;
        wx.getSystemInfo({
          success: function (res) {
            console.log(res);
            // 屏幕宽度、高度
            console.log('height=' + res.windowHeight);
            console.log('width=' + res.windowWidth);
            // 高度,宽度 单位为px
            that.setData({
              windowHeight:  res.windowHeight,
              windowWidth:  res.windowWidth
            })
          }
        })
      },
    
      onShow: function () {
       
      },
    
      buttonStart: function (e) {
        startPoint = e.touches[0]
      },
      buttonMove: function (e) {
        var endPoint = e.touches[e.touches.length - 1]
        var translateX = endPoint.clientX - startPoint.clientX
        var translateY = endPoint.clientY - startPoint.clientY
        startPoint = endPoint
        var buttonTop = this.data.buttonTop + translateY
        var buttonLeft = this.data.buttonLeft + translateX
        //判断是移动否超出屏幕
        if (buttonLeft+50 >= this.data.windowWidth){
          buttonLeft = this.data.windowWidth-50;
        }
        if (buttonLeft<=0){
          buttonLeft=0;
        }
        if (buttonTop<=0){
          buttonTop=0
        }
        if (buttonTop + 50 >= this.data.windowHeight){
          buttonTop = this.data.windowHeight-50;
        }
        this.setData({
          buttonTop: buttonTop,
          buttonLeft: buttonLeft
        })
      },
      buttonEnd: function (e) {
    
      },
    

    click_type: function (v) {
        console.log(v);
         let tid = Number(v.currentTarget.dataset.id);
         console.log(now_type);
         console.log(tid);
        this.setData({
            TabCur: v.currentTarget.dataset.id,
            scrollLeft: (v.currentTarget.dataset.id - 1) * 60,
            now_type: tid
        })
        console.log(now_type);
        console.log(tid);
    },

    onLoad(options) {
        // problem.fitOptions(this, options);//移步onUpdate
        io.helpGotoParam(this, 'answersheet');
        io.helpGoto(this, 'combat', {
            combat: true,
        });
        problem.helpClearall(this);
        this.setData({
            now_type: 0
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        problem.fitOptions(this);
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

    }
})