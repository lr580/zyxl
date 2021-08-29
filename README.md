## 全局变量定义

云存储根目录完整url：

```js
cloudpath: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896',
```

五种类别常量(类别下标和文字一一对应)：

```js
type_p: ['感情', '学习', '心灵', '职业', '校园热点', '全部'],
```

互动视频相关变量：(动态读取数据库加载)

```js
info_video: [],
num_video: 0,
```

数据库单次读取记录条数上限常量：

```js
batch: 20,
```

用户ID和信息： (-1是未登录，否则是用户对象的openid)

```js
openid: '',
info_user: null,
```

up主下标(即ID)对应的昵称和头像url信息：

```js
info_up: [],
```

推荐视频的下标和数量(常量)：

```js
info_recommend: [],
num_recommend: 4,
```

海报图片完整路径：

```js
info_placard: [],
```

所有帖子： (反正就算几十万字也就几MB而已，一并读取算了)

```js
info_post: [],
num_post: 0,
```

所有用户：(对于非自己的人，代码上只调用昵称和头像)

```js
info_user: [],
num_user: 0,
```

> 当num_post或num_user过多时，未来版本可能会撤销info_post和info_user以降低用户流量消耗(但是代价是每点一个东西都要加载半天，因为缺乏了预加载)



## 云开发目录结构

### 云开发

#### video

存储视频对象(见下文)

#### user

存储用户对象(见下文)

#### global

##### default

项目：

1. num_video number
2. up array([string, string]) 下标(UP主ID)对应的UP主昵称和头像完整url
3. recommend array(string) 推荐的互动视频下标
4. placard array(string) 海报图片(相对路径)

### 云存储

#### video

存储视频格式：强制要求mp4 (读取方便 且 兼容性高)

命名格式：`v`+视频id+`-`+片段id 如`v2-3`

特殊视频片段：

- `fail1` 视频加载失败时显示的视频片段



#### videoposter

视频封面，没有后缀要求(常见图片后缀均可，甚至没有封面名字命名要求，但推荐以视频id为名字)

特殊封面：

- `unknown_poster.jpg` 默认/未知封面



#### avatar

用户头像，没有后缀要求(常见图片后缀均可)，默认上传的系统给起是什么名字就是什么名字

特殊头像：

- `unknown_user.jpg` 默认/未知用户



#### placard

海报图片，没有文件名要求



#### postpic

帖子图片，常见图片后缀均可，没有文件名要求，默认上传的系统给起是什么名字就是什么名字





### 云函数

getOpenId 



## 小剧场

### 整体结构

#### 视频数据结构

视频片段组成DAG

每个视频片段是一个节点，根节点(起始片段)编号为0

出度为0的节点是结局，显示节点标题

存图使用邻接表存边



#### 视频对象

1. id string

   所有对象的id从0开始递增，是string(但是本质是数字)

2. title string

3. up string 发布者ID(见全局变量)

4. type number 类型下标

5. time date

6. click number

7. poster string (相对路径url，不包含文件夹的完整文件名如`0.jpg`)

8. node array套object  暂时不实现

   - title string 节点名字

9. clipname array(string) 节点名字(替代8)

10. edge array套array套object：

    - id number 跳转的片段ID
    - info string 选项信息



注：

- 重新进入小程序才会刷新视频的浏览次数。
- 当type不是0~4整数时，表示该视频被删除(因为无法通过正常途径看到该视频)。建议把type=-1当作被删除类型。





### 样例视频结构示意图

> 仅展示有意义的样例视频

#### 0

```mermaid
graph TD
	v0["0星月的暑假计划"]-->|"学Python"|v1["1学会了爬虫"]
	v0-->|"学画画"|v2["2成为了大触"]
	v0-->|"参加活动"|v3["3收获了人脉和能力"]
	v0-->|"寻衅滋事"|v4["4[E]案牍之牢行"]
	v1-->|"辅助学习"|v5["5瓶颈期"]
	v2-->v6["6[E]我们都有光明的未来"]
	v3-->v6
	v1-->|"窃取隐私"|v4
	v5-->|"咬牙坚持"|v6
	v5-->|"算逑"|v7["7[E]回归平凡"]
```



## 树洞

### 整体结构

#### 帖子对象

1. _id string 格式为：
2. title string 标题，限长30字符
3. abbr string 摘要(显示在树洞页)，限长80字符
4. type number 0~4是正常类别 
5. time_publish Date
6. time_active Date
7. click number
8. user string 即user的ID/openid
9. content string 富文本，即HTML文本
10. replyto number 回复的帖子ID
11. reply array(number) 跟帖帖子ID(按楼层数字顺序，维护有序)
12. parent number 被回复的帖子ID



#### 帖子ID分配的改进意见

原方案(心行+学舟)这种点进发帖页面发表新帖先临时占用一个帖子ID的做法会缺点：

1. 用户强退时该帖子ID将会被永久无效占领
2. 恰好多个用户同一时间点击发帖按钮时会占用同一个ID而导致bugs

并且第一个问题会引发新的bugs：

1. 无效的ID会在预处理时占用大量的无效读取次数，甚至导致读取失败报错崩溃

未来版本的一个ID分配设想如下：

1. 帖子ID使用较长的等长随机大小写和数字字符(类似于openID)等，可以：
   - 随机刷等长普通字符(英文数字下划线)
   - 用户ID+`_`+用户帖子序号 (但是还需要保存帖子序号，考虑到删除问题)
   - 用户ID+随机刷 (还不如直接刷)
   - 当前时间戳
2. 点击发帖时什么也不做，点击确认发帖时才上交服务器

现在由于图片使用了随机字符，不再需要固定格式，所以分配设想的第二点可行，所以现在采用第二点方案。取消学舟的预分配策略。可以解决上述bugs。

考虑到延迟问题(只采用第二个时，分配的ID如果还是有序，那么会有时差，即假设在4h登录，5h有人发两个帖，自己在6h发一个帖，那么这个帖子将会覆盖那个人发的第一个帖子)，所以仍然需要使用随机ID。或者用自己的id计数。代价是批量读取数据时比较麻烦。

用户id+序号的缺点是麻烦，而且id太长，因为用户id很长，而用户id不能截断，因为会有很多用户前缀一致。开哈希截断又麻烦。而且还要统计用户ID后面的随机或计数。当然事实上是可以直接无脑随机刷一个随机字符的。

或者有一个新的方案：直接用当前时间作帖子ID，这样有很多事实上的好处。总的来说胜过上述的方案。时间戳的好处是几乎不会重复，因为精确到了毫秒，而且排序方便，而且也不是特别长(与openid相比)。



## 用户板块

### 整体结构

#### 用户对象

1. id string 与openid和_id一致
2. _openid string  数据库记录创建时自动生成的
3. name string 要求length不超过某个值
4. school string 学校信息(选填) 要求length不超过40 暂时不实现
5. motto string 个性签名 要求length不超过某个值
6. point number 积分
7. warehouse array(元素为[number, number]) 仓库(商品id+数目)
8. appointment_talk array(元素为date)
9. appointment_vr array(元素为date)
10. star_video array(元素为[string,date]) 下文排序均由时间近到远，维护有序
11. star_post array(元素为[string,date])
12. history_video array(元素为[string,date])
13. history_post array(元素为[string,date])
14. post array(string) 发表的帖子
15. message array([Boolean, string, string]) 是否已读，回帖人，被回帖子
16. avatar 头像url(完整地址)



#### 批量页面

由于收藏和浏览记录实现逻辑几乎一致，所以两个页面实质上共用代码逻辑，所以js代码是统一的。两个页面的data数据详见代码。



## 更新日志

2021-8-25

1. 完成了互动视频的核心部分，可以正常实现互动的所有逻辑 (暂未支持全屏)
2. 制作了一个简陋的互动视频样例

2021-8-26

1. 增加了若干细节：
   - 实现了点击增加浏览次数
   - 现在支持非互动视频
   - 现在视频片段均自动播放、且新增支持拖动画面以拖动进度条
2. 实现了"剧场"页面的独立逻辑部分(除搜索)

2021-8-27

1. 实现了用户板块的如下功能：
   1. 用户的注册、自动登录和删除
   2. 用户基本信息的修改
   3. 用户浏览记录的增加、收藏和取消收藏的实现、首次点击积分的增加
2. 现在“剧场”的互动视频可以在后台自由更改UP主名称和头像
3. 修改了剧场首页布局，现在剧场首页拥有正常的前端页面

2021-8-28

1. 实现了用户板块的浏览和收藏记录页面的逻辑部分
2. 实现了首页的全部逻辑功能
3. 修改了剧场首页UI，增加了用户首页UI









