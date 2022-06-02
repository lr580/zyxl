// pages/answersheet/answersheet.js
import * as io from '../../js/common/io'
import * as problem from '../../js/base/problemCtrl'
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    /*options:
    若有vty,为多少代表当前是视频做题，无就是题库（有type和index）或对战
    */
    onLoad(options) {
        problem.fitOptions(this, options);
        io.helpInput(this, 'answer');
        problem.bindNextProblem(this);
        io.helpGoback(this);
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