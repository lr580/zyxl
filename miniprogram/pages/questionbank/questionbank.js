// pages/questionbank/questionbank.js
import * as io from '../../js/common/io'
import * as problem from '../../js/base/problemCtrl'
const app = getApp();
var now_type = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        TabCur: 0,
        scrollLeft:0
    },

    /**
     * 生命周期函数--监听页面加载
     */

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