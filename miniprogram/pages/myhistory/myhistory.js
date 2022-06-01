// pages/myhistory/myhistory.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        TabCur: 0,
        scrollLeft: 0,
        collect_type: ['视频', '树洞']

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //该页面js代码使用批量生产，具体见app.js的init_pair_pagejs函数内的注释，以查看data和其他Page函数及其说明
        getApp().init_pair_pagejs(this, 'history', '浏览');
    },
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        })
        let newv = Number(e.currentTarget.dataset.id);

        this.setData({
            sele_bar: newv,
        });
        if (newv == 0) {
            this.init_pfirst();
        } else {
            this.init_psecond();
        }
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