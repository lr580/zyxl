// pages/combat/combat.js
import * as dates from '../../js/common/dateCalc';
import * as io from '../../js/common/io';
import * as problem from '../../js/base/problemCtrl';
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        dates.helpTimer(this, 'timer1');
        dates.helpTimer(this, 'timer2');
        this.init_timer1();
        this.init_timer2();
        problem.fitOptions(this, {
            'combat': true
        });
        io.helpInput(this, 'answer1');
        io.helpInput(this, 'answer2');
        problem.bindNextProblem(this, 'submit1', 'player1', 'answer1');
        problem.bindNextProblem(this, 'submit2', 'player2', 'answer2');
    },

    oncemore() {
        this.stop_timer1();
        this.stop_timer2();
        this.onLoad();
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