//app.js
// const km = getApp() //即this, app.js外均可这么使用
var db;
var _;

var now_loading = 0; //需要batch_read等异步多少次
var total_loading = 1;

App({
  onLaunch: function () {
    const thee = this;

    //这里load_video是局部函数
    //如果load_video换成与onLaunch并列的函数，会导致thee不可用
    //但是可以用getApp()
    // var load_video = function () {
    //   console.log('qwq');

    // };

    wx.showLoading({
      title: '加载中……',
      mask: true,
      success: (res) => { },
      fail: (res) => { },
      complete: (res) => { },
    });

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-5gb77mtq8dcc1698',
        traceUser: true,
      }).then(rea => {
        db = wx.cloud.database();
        _ = db.command;
        thee.load_global();
      }).catch(rwa => {
        console.error('读取数据失败，请检查网络。', rwa)
      });
    }

    this.globalData = {
      cloudpath: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896',
      type_p: ['感情', '学习', '心灵', '职业', '校园热点'],
      info_video: [],
      num_video: 0,
      batch: 20, //每次向数据库的最大读取批次
    }
  },

  //批量获取某集合编号id从0到n-1的数据对象，存在全局变量key上
  batch_read(setname, n, key) {
    let km = getApp();
    let epoch = km.globalData.batch;
    let inq_time = Math.ceil(n / epoch);
    let now_time = 0;
    var all_obj = [];

    const cmp = function () {
      return function (a, b) {
        return Number(a['_id']) - Number(b['_id']);
      }
    }

    var final_operation = function () {
      all_obj.sort(cmp());
      km.globalData[key] = all_obj;
      if (++now_loading == total_loading) {
        km.init_finish();
      }
    };
    if (n == 0) { final_operation(); }

    for (let i = 0; i < inq_time; ++i) {
      var this_batch = []; //这次要读的下标编号
      for (let j = i * epoch; j < Math.min(n, (i + 1) * epoch); ++j) {
        this_batch.push(String(j));
      }
      db.collection(setname).where({ _id: _.in(this_batch) }).get().then(rea => {
        for (let k = 0; k < rea.data.length; ++k) {
          all_obj.push(rea.data[k]);
        }
        if (++now_time == inq_time) {
          final_operation();
        }
      }).catch(rwa => {
        console.error('批量读取失败：', setname, n, key, j);
      })
    }
  },

  //调试函数，等待随机0~1秒后返回等待时长
  network_is_low: function () {
    return new Promise((resolve) => {
      k = Math.random();
      setTimeout(() => {
        resolve(k);
      }, k * 1000);
    })
  },

  //读取全局数据
  load_global: function () {

    let km = getApp();
    db.collection('global').doc('default').get().then(res => {
      km.globalData.num_video = res.data.num_video;
      km.load_video();
    }).catch(rws => {
      console.error('全局数据获取失败。')
    });
  },

  //读取全局数据完毕
  init_finish:function(){
    wx.hideLoading({
      success: (res) => {},
    });
  },

  //读取所有小剧场互动视频文本信息(视频信息不读取)
  load_video: function () {
    this.batch_read('video', getApp().globalData.num_video, 'info_video');
  },

  //通用函数，传入date，返回年月日(时分 type=0)的格式化文本
  date2str: function (x, type = 0) {
    let s = '', t = '';
    s += String(x.getFullYear());
    s += '/';
    t = String(x.getMonth() + 1);
    if (t.length < 1) { s += '0' + t; }
    else { s += t; }
    s += '/';
    t = String(x.getDate());
    if (t.length < 1) { s += '0' + t; }
    else { s += t; }
    if (type != 0) { return s; }
    s += ' ';
    t = String(x.getHours());
    if (t.length < 1) { s += '0' + t; }
    else { s += t; }
    s += ':';
    t = String(x.getMinutes());
    if (t.length < 1) { s += '0' + t; }
    else { s += t; }
    return s;
  },
})

//调试型函数，正式版删除
// async function fn() {
//   db.collection('global').doc('default').get().then(res => {
//     console.log(getApp().globalData)
//     let w = await db.collection('global').doc('default').get()
//     console.log('w', w)
//   }).catch(rws => {
//     console.error('rws', rws);
//   })
// }