// pages/shop/shop.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    num_sele: [],//选择买第(下标)件物品多少个
    my_num: {},//自己现在拥有多少个(散列表)
    my_money: 0,//余额
    busy: false,//防止频繁点击
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
  },

  //初始化
  init: function () {
    let num_sele = [];
    let wh = km.globalData.info_user.warehouse;
    let my_num = [];
    for (let i = 0; i < km.globalData.info_goods.length; ++i) {
      num_sele.push(0);
      if (wh[i]) {
        my_num.push(wh[i]);
      } else {
        my_num.push(0);
      }
    }
    console.log(km.globalData.info_goods)
    this.setData({
      goods: km.globalData.info_goods,
      my_money: km.globalData.info_user.point,
      num_sele: num_sele,
      my_num: my_num,
    });
  },

  //商品e选择增加1数目
  numsele_up: function (e) {
    let arr = this.data.num_sele;
    let i = Number(e.currentTarget.id);
    arr[i] = this.data.goods[i][2] ? Math.min(arr[i] + 1, this.data.goods[i][0]) : arr[i] + 1;
    this.setData({
      num_sele: arr,
    });
  },

  //商品e选择减少1数目
  numsele_down: function (e) {
    let arr = this.data.num_sele;
    let i = Number(e.currentTarget.id);
    arr[i] = Math.max(0, arr[i] - 1);
    this.setData({
      num_sele: arr,
    });
  },

  //购买商品e
  buy: function (e) {
    let id = Number(e.currentTarget.id);
    let num = this.data.num_sele[id];
    if (num == 0) {
      wx.showToast({
        title: '您选的购买数量是0',
        icon: 'none',
      })
      return;
    }
    let cost = this.data.goods[id][1] * num;
    if (cost > this.data.my_money) {
      wx.showToast({
        title: '积分不足！',
        icon: 'none',
      })
      return;
    }

    if (this.data.busy) {
      wx.showToast({
        title: '请勿频繁点击',
        icon: 'none',
      });
      return;
    }
    wx.showLoading({
      title: '购买中……',
    });
    this.setData({
      busy: true,
    });
    let tot = 2;
    let now = 0;
    let thee = this;
    let upd = function () {
      if (++now == tot) {
        wx.hideLoading({
          success: (res) => { },
        });
        thee.setData({
          busy: false,
        });
        thee.init();
      }
    };
    let fail = function (info, rws) {
      wx.hideLoading({
        success: (res) => { },
      });
      thee.setData({
        busy: false,
      });
      wx.showToast({
        title: '购买失败，请重试！',
        icon: 'none',
        duration: 3000,
      });
      console.error(info, rws);
    }

    let goods = this.data.goods;
    if (goods[id][2]) {
      goods[id][0] -= num;
    }

    db.collection('global').doc('default').update({
      data: {
        goods: goods,
      }
    }).then(res => {
      km.globalData.info_goods = goods;
      upd();
    }).catch(rws => {
      fail('更新商品数量', rws);
    });

    let warehouse = km.globalData.info_user.warehouse;
    if (warehouse[id]) {
      warehouse[id] += num;
    } else {
      warehouse[id] = num;
    }

    db.collection('user').doc(km.globalData.openid).update({
      data: {
        warehouse: warehouse,
        point: thee.data.my_money - cost,
      }
    }).then(res => {
      km.globalData.info_user.warehouse = warehouse;
      km.globalData.info_user.point = thee.data.my_money - cost;
      upd();
    }).catch(rws => {
      fail('更新用户持有数量', rws);
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