这是我在另一个微信小程序项目(开源在 `github` 名为`witvilly`的代码仓库)写的通用 js 方法。

### 函数

按照文件层次描述了可供调用的 (public) 函数的基本信息。

在 `js` 目录内，所有通用性高(即放到别的程序也能用的代码)的内容将在子目录 `common` 内；专用性(即只在本程序较为适用)的内容放在其他子目录内。

#### common

##### obj

Object 功能拓展。[对象深复制参考](https://blog.csdn.net/weixin_46074961/article/details/122412958) [数组深复制](https://blog.csdn.net/weixin_46074961/article/details/122415014)

- `clone(obj)` 返回深复制结果。

##### md5

标准 md5 非对称加密库。[参考](https://www.cnblogs.com/kiko2014551511/p/11610943.html)

- `md5(string)` 将字符串加密，返回长 32 的字符串代表加密结果

##### dateCalc

时间、日期计算专用。

考虑到在数据库存储的处理不便，考虑到本程序的需求，此处规定日期存储统统用 `yyyymmddhhmmss` 格式整数，命名为 `strDate` 或简写为 `str`。若 `hhmmss` 全 `0` ，可简写为 `yyyymmdd`。若任意信息未知，缺省填全 0。全 0 代表不存在的日期。并提供如下函数：

> [参考-format方法增加](https://wenku.baidu.com/view/9d645cfc6c1aff00bed5b9f3f90f76c661374ccc.html)

- `Date2Str(src)` , `src` 是 Date ，返回  `yyyymmddhhmmss` 格式整数
- `Str2Date(src)` , `src` 是 `strDate` ，返回 Date 。
- `get_ymd(v)` 对 Date 返回 `{yy, mm, dd}`
- `get_ymdhms(v)` 对 Date 返回 `{yy, MM, dd, hh, mm, ss}`
- `print(v, type = 0)` 对 Date / <u>时间戳</u> 返回 `%04d/%02d/%02d` ，若 type = 1，加多 `%02d:%02d:%02d`
- `helpTimer(handler, varname = 'timer', interval = 100)` 给 page 注册一个计时器变量，使用时间戳相对值，每 interval 毫秒刷新一次。使用 `handler.init_varname()` 初始化，`handler.stop_varname()` 终止。变量值用 `handler.data.varname` ，输出的字符串变量值用 `handler.data.varname_show`



##### promisify

异步操作简化库。[参考](http://news.558idc.com/122801.html)

- `promisify(f)` ，传入一个函数，将它强转异步函数。此时在 `async` 里用 `await` 可以接收它的值(注意`try..catch..finally`)，如：

  ```js
  const acloud = promisify(wx.cloud.callFunction);
  try {
      console.log(1);//为了表明是异步而在异步前输出点东西
      const openidPack = await acloud({
          name: 'getopenid'
      });
      const openid = openidPack.result.openid;
      console.log(openid);
  } catch (err) {} finally {}
  ```

- `acloud` 即 `wx.cloud.callFunction` 的异步函数

- `awx` 对象，是被用 `promisify` 打包了的改编 `wx` 异步函数。



##### io

调试和弹窗输出，并提供频繁点击锁。

调试输出可以手动关闭。默认每种输出都有调试输出

- `err(cerr, outmsg = '网络错误，请重试', duration = 1000)` 弹窗报错

- `print(info, icon = 'none', duration = 1000)` 弹窗输出

- `log` / `out` 调试输出，同 `console.log`。可以批量关闭。

- 同理，有 `time` , `timeEnd` , `timeOut` 函数，代替 `console` 的对应函数。

- `helpInput(handler, key = '', dest = '', funcName = '', obj = 'input')` 

  生成一个 input 的 `bindinput` ，函数名为 `funcName` 默认为 `input_`+key，存储值为 `handler.data.obj.dest`，其 `dest` 默认为 key。每次输入时将输入值放到该变量里，调用 `handler.setData`。其中 `handler` 是页面 page 的传引用 this。若 `handler` 没有这个 `dest` 或 `obj` 自动新定义一个。

- `helpInputs` 参数同上，按空白字符和标点符号分割输入为数组存储；去除首尾空白

- `helpInputSex` , `helpInputDate` 参数同上，自动转换格式为存储格式

- `initLock(handler, lockname = '1')` 

  为 page 添加一个防频繁点击锁，锁ID为 `lockname`。之后使用 `checklock_lockname` 来加锁，若之前已经锁了那么就返回 true(可以直接 return)，用 `unlock_lockname` 来解锁。可以在 `handler.data.locks.lockname` 看到这个布尔值变量锁。

- `lockfunc(handler, lockname, func, async = false) ` 

  在上文的基础上，绑定一个锁函数 `func` ，函数名为 `lockname` ，执行该函数体。目前暂时只有无参函数，如果想要有参用 `initLock`。

- `helpGoto(handler, url, param = {}, funcName = '', full = false)` 

  为 page 绑定一个 `funcName` 函数，调用跳转到名为 `url` 的页面，参数列表为 `param`。若 `funcName` 缺省，`funcName='goto_'+url`，若非 `full`，令 `url` 为 `/pages/url/url`。

- `helpGotoParam(handler, url, funcName = '', full = false)`

  绑定函数，其跳转参数用触发事件的标签的 `data-key='value'` 的 `key:value` 来做参数

- `helpGoback(handler)` 绑定一个 `goback` 函数，点击返回上一个页面。

- `setData(handler, ...param)` 调用 page 的 `setData`，以 `param` 奇数为 key，偶数为 value。

  `setDatas(handler, param)` 简写式(格式同原有)。

- `uploadImages(cnt = 9, root = 'rich/')` 上传最多 `cnt` 张图片到云存储路径 `root` 目录下，返回完整目录数组或不完整目录数组(`abbr=true`)

- `uploads(src, dest)` 将临时文件URL数组`src`的文件上传到云路径数组`dest`。

- `transformSex(val)` 将输入格式的性别转化为后台存储格式

- `transformPicktime(val)` 将输入格式的日期转化为后台存储格式



##### randoms

随机造数据用，主要作调试。

- `name(sex = 0, len = 0)`，生成随机名字，若 `sex=0` 性别随机， `1` 男， `2` 女。字库来源自分析[该网站](https://www.qqxiuzi.cn/zh/xingming/)，名长，若 `len=0` 则 0.3 概率得到 1，0.7 得到 2；姓名长=单姓长+名长
- `choice(arr)` 从数组随机取出一个元素
- `randint(a, b)` 获取区间 \[a,b\] 内随机整数
- `Array.shuffle` / `shuffle(array)` 重载打乱 [参考](https://blog.csdn.net/Slueia/article/details/110470328)



##### spells

汉字转拼音。 [参考](https://blog.csdn.net/qq_32442973/article/details/117376530)

- `convert(l1, upper = false)` ，将 `l1` 内汉字全转化为拼音，标点符号空格清理，其他不变， `upper` 是否首字母大写。

