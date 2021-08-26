// miniprogram/pages/Me/Me.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid: -1,
    userinfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init_userpage();
  },

  //初始化函数
  init_userpage: function () {
    this.setData({
      userid: km.globalData.userid,
      userinfo: km.globalData.info_user,
    });
  },

  //注册(首次登录)
  register: function () {
    let thee = this;
    wx.getUserProfile({
      desc: '请授权获取您的头像和昵称',
      success: (ret) => {
        console.log('awa', ret);
        //技术问题……实现不了从微信给的url里提取内容转存到云存储
        // wx.cloud.uploadFile({
        //   // url: ret.userInfo.avatarUrl,
        //   url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqgABHgMRicDibu4tMI2KUe7qKPhez3QZdSw3Xa90UQYia2njxUzldApErwIDtl2b4uP9X8dkG0uVQzA',
        //   filePath: '132',
        //   cloudPath: 'avatar/' + km.globalData.openid + '.jpg',
        //   success: (reu) => {

        //   },
        //   fail: (rwu) => {
        //     console.error('保存用户头像失败！', rwu);
        //   },
        // })
        thee.create_newuser();
      },
      fail: (rwt) => {
        thee.create_newuser('unknown_user.jpg', '未命名用户');
      },
    });
    return;
    //下面废置代码，以后删除
    wx.showModal({
      cancelColor: 'cancelColor',
      title: '提示',
      content: '是否使用微信头像和昵称？',
    }).then(res => {
      console.log(res)
      if (res.confirm) {
        //这样不会触发，所以放弃了这种逻辑
        wx.getUserProfile({
          desc: '请授权获取您的头像和昵称',
          success: (ret) => {
            console.log('awa', ret)
          },
        })
      } else if (res.cancel) {
        thee.create_newuser('unknown_user.jpg', '未命名用户');
      }
    }).catch(rws => {
      console.error('弹窗异常');
    });
  },

  //创造新用户
  create_newuser: function (avatar, name) {

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