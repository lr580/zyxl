// pages/postt/postt.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editorCtx: '', //富文本编辑框API
    formats: {},  //富文本编辑框样式使用
    readOnly: false, //富文本编辑框样式使用
    editorHeight: 300, //富文本编辑框样式使用
    keyboardHeight: 0, //富文本编辑框样式使用
    isIOS: false, //富文本编辑框样式使用

    edit: false, //是否编辑模式
    id: -1, //当前处理的帖子ID
    rep_name: '', //被回复人名称
    rep_floor: -1, //被回复人楼层
    isreplypost: false,//是否是跟帖
    isreplyreply: false,//是否是回帖
    ftitle: '',//被跟帖子标题

    types: [],//分类类别
    busy: false,//防止频繁点击

    s_title: '',//标题框文本
    s_type: 0,//分类框选中类别下标
    s_abbr: '',//摘要文本
    fid: -1, //跟帖的被跟帖子id
    rid: -1, //回帖的被回帖子id
    fuid: '',//跟帖的被跟用户openid
    ruid: '',//回帖的被回用户openid
  },

  /* options格式要求：
 如果什么都没有，就是发布新帖子
 如果带edit关键字就是编辑模式
 编辑模式下需要带id关键字，带被编辑帖子id
 如果带fid关键字，就是跟帖，且被回的帖子id是fid
 带fid关键字的情况下，必然带ftitle关键字，即被跟帖的标题
 如果带rid关键字，就是回复帖子，且被回复帖子id是rid，rid出现的充分条件是fid出现
 带rid关键字的情况下，必然带rfloor关键字，即被回复楼层
 带rid关键字的情况下，必然带rname关键字，即被回复人昵称
 事实上rfloor,rname,ftitle可以不传入，但是这里传入是考虑到未来可能删去info_user和info_post将不再可以获取信息
 另：假设能够点击进入该页面的人都是已经登陆的用户
 然而由于openid这破玩意实在是太长了……塞两个(跟帖和回帖同时)url忍不下，所以并不能页面传递openid
 在删除了info_post情况下考虑每读到一个帖子情况下每次数据库读到的东西都存起来，记忆化大模拟ex吐了
 */
  onLoad: function (options) {
    console.log(options);
    this.init(options);
  },

  onUnload: function () {

  },

  //初始化
  init: function (options) {
    this.setData({
      types: km.globalData.type_p,
    });

    if (options.edit != undefined) {
      this.setData({
        edit: true,
        id: Number(id),
      });
    }
    if (options.fid != undefined) {
      this.setData({
        isreplypost: true,
        fid: Number(options.fid),
        ftitle: options.ftitle,
        fuid: km.globalData.info_post[Number(options.fid)].user,
      })
    }
    if (options.rid != undefined) {
      this.setData({
        isreplyreply: true,
        rid: Number(options.rid),
        rep_name: options.rname,
        rep_floor: options.rfloor,
        ruid: km.globalData.info_post[Number(options.rid)].user,
      });
    }

    this.init_editor();
  },

  //初始化富文本编辑框
  init_editor: function () {
    const platform = wx.getSystemInfoSync().platform;
    const isIOS = platform === 'ios';
    this.setData({ isIOS });
    const that = this;
    this.updatePosition(0);
    let keyboardHeight = 0;
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) {
        return;
      }
      const duration = res.height > 0 ? res.duration * 1000 : 0;
      keyboardHeight = res.height;
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight);
            that.editorCtx.scrollIntoView();
          }
        })
      }, duration);

    });
  },

  //富文本编辑框就绪
  mi_ready: function () {
    const thee = this;
    wx.createSelectorQuery().select('#main_input').context(res => {
      thee.editorCtx = res.context;
    }).exec();
  },

  //输入标题
  scanf_title: function (e) {
    let v = e.detail.value;
    this.setData({
      s_title: v,
    });
  },

  //输入摘要
  scanf_abbr: function (e) {
    let v = e.detail.value;
    this.setData({
      s_abbr: v,
    });
  },

  //选择类别
  sele_type: function (v) {
    let t = Number(v.currentTarget.id);
    this.setData({
      s_type: t,
    });
  },

  //保存所有内容，发布
  save_all: function () {
    const thee = this;
    thee.editorCtx.getContents({}).then(res => {
      let nr = res.html;
      thee.publish(nr);
    }).catch(rws => {
      console.error('获取富文本内容失败', rws);
    });
  },

  //保存发帖，正文为nr
  publish: function (nr) {
    let obj = {};
    if (this.data.edit) {
      obj = km.globalData.info_post[Number(this.data.id)];
    }
    if (this.data.isreplypost == false) { //是主题
      obj.title = this.data.s_title;
      if (obj.title.length == 0) {
        wx.showToast({
          title: '标题不能为空！',
          icon: 'none',
        });
        return;
      }
      obj.type = Number(this.data.s_type);
      obj.abbr = this.data.s_abbr;
    } else {//是跟帖
      obj.title = '';
      obj.type = -1;
      obj.abbr = '';
    }
    let nowtime = new Date;
    let nowtimeid = Number(nowtime); //以当前时间戳作为帖子ID
    if (this.data.edit == false) { //是新帖
      obj._id = nowtimeid;
      this.setData({
        id: nowtimeid,
      });
      obj.time_publish = nowtime;
      obj.click = 0;
      obj.replyto = '';
      obj.reply = [];
      obj.parent = '';
    }
    obj.time_active = nowtime;
    obj.user = km.globalData.openid;
    if (this.data.isreplyreply) { //是回帖
      obj.replyto = this.data.rid;
    }
    if (this.data.isreplypost) {//是跟帖
      obj.parent = this.data.fid;
    }
    obj.content = nr;

    // console.log(obj);可能后续还要console.log，先不删代码

    wx.showLoading({
      title: '保存中……',
    });

    let all_todos = 2;//待做云操作列表 (本帖+num_post global)
    let now_todos = 0;//当前进度
    let thee = this;

    var fail = function (io, rws) {
      console.error(io, rws);
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '保存失败，请重试！',
        icon: 'none',
        duration: 2000,
      });
    };

    var final = function () {
      wx.navigateBack();
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '保存成功！',
        duration: 2000,
      });
    };

    var upd = function () {
      // console.log('=w=', now_todos + 1, all_todos);
      if (++now_todos == all_todos) {
        final();
      }
    };

    if (this.data.edit == true) {
      db.collection('post').doc(String(thee.data.id)).update({
        data: obj,
      }).then(res => {
        // console.log('awa编辑');
        km.globalData.info_post[Number(thee.data.id)] = obj;
        upd();
      }).catch(rws => {
        fail('保存编辑失败', rws);
      });
    } else {
      db.collection('post').add({
        data: obj,
      }).then(res => {
        // console.log('awa发帖');
        km.globalData.info_post[Number(thee.data.id)] = obj;
        upd();
      }).catch(rws => {
        fail('发帖失败', rws);
      });
    }

    db.collection('global').doc('default').update({
      data: {
        num_post: _.inc(1),
      }
    }).then(res => {
      upd();
    }).catch(rws => {
      fail('更新帖子数目', rws);
    });

    if (this.data.edit == false) { //用户自己新增帖子
      all_todos++;
      db.collection('user').doc(km.globalData.openid).update({
        data: {
          post: _.unshift(thee.data.id),
        }
      }).then(res => {
        km.globalData.info_user.post.unshift(thee.data.id); //头部插入方便排序
        upd();
      }).catch(rws => {
        fail('用户信息更新失败', rws);
      });
    }

    if (this.data.isreplypost) { //跟帖
      all_todos += 2; //给主题人消息，更新主题本帖

      let newinfo = [true, km.globalData.openid, thee.data.fuid];
      db.collection('user').doc(thee.data.fuid).update({
        data: {
          message: _.unshift(newinfo),
          time_active: nowtime,
        }
      }).then(res => {
        upd();//理论上当前小程序内不用更新这个消息，只需要后台更新
      }).catch(rws => {
        fail('通知主题贴主', rws);
      });

      db.collection('post').doc(thee.data.fid).update({
        data: {
          reply: _.push(thee.data.id),
        }
      }).then(res => {
        km.globalData.info_post[thee.data.fid].push(thee.data.id);
        upd();
      }).catch(rws => {
        fail('更新主题帖子', rws);
      });
    }
    if (this.data.isreplyreply) { //回帖
      //km.info_post[this.data.rid].user
      if (thee.data.ruid != km.globalData.openid) {//不是我回我自己
        all_todos++; //给被回帖人消息
        let newinfo = [true, km.globalData.openid, thee.data.ruid];
        db.collection('user').doc(thee.data.ruid).update({
          data: {
            message: _.unshift(newinfo),
          }
        }).then(res => {
          upd();//理论上当前小程序内不用更新这个消息，只需要后台更新
        }).catch(rws => {
          fail('通知被回复的用户', rws);
        });
      }
    }
    // console.log(all_todos);
  },

  /*以下内容是富文本编辑框官方模板 */
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    });
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50;
    const { windowHeight, platform } = wx.getSystemInfoSync();
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight;
    this.setData({ editorHeight, keyboardHeight });
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync();
    const { statusBarHeight, platform } = systemInfo;
    const isIOS = platform === 'ios';
    const navigationBarHeight = isIOS ? 44 : 48;
    return statusBarHeight + navigationBarHeight;
  },
  blur() {
    this.editorCtx.blur();
  },
  format(e) {
    let { name, value } = e.target.dataset;
    if (!name) {
      return;
    }
    this.editorCtx.format(name, value);

  },
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({ formats });
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
      }
    });
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
      }
    });
  },
  removeFormat() {
    this.editorCtx.removeFormat();
  },
  /*以上内容是富文本编辑框官方模板 */
  insertImage() {
    const that = this, thee = this
    wx.chooseImage({
      count: 1, //1就行了，多个太费劲了
    }).then(res => {
      if (res.tempFilePaths.length == 0) {
        return;
      }
      let tp = res.tempFilePaths[0];
      let url_relative = tp.substr(tp.lastIndexOf('/') + 1);
      let url_abs = km.globalData.cloudpath + '/postpic/' + url_relative;
      wx.showLoading({
        title: '上传中……',
      });
      wx.cloud.uploadFile({
        filePath: tp,
        cloudPath: 'postpic/' + url_relative, //注意格式不是绝对url地址
      }).then(ret => {
        wx.hideLoading({
          success: (res) => { },
        });
        thee.editorCtx.insertImage({
          src: url_abs,
          width: '50%',
        }).then(reu => {
        }).catch(rwu => {
          console.error('载入图片失败！', rwu);
        });
      }).catch(rwt => {
        wx.hideLoading({
          success: (res) => { },
        });
        wx.showToast({
          title: '保存图片失败！请重试！',
          icon: 'none',
        });
        console.error('保存到云端图片', rwt);
      });

    }).catch(rws => {
      console.error('上传图片', rws);
      wx.showToast({
        title: '上传图片失败，请重试！',
        icon: 'none',
      });
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