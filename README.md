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

### 云存储

#### video

存储视频格式：强制要求mp4 (读取方便 且 兼容性高)

命名格式：`v`+视频id+`-`+片段id 如`v2-3`

特殊视频片段：

- `fail1` 视频加载失败时显示的视频片段



### 云函数

getOpenId 



#### videoposter

视频封面，没有后缀要求(常见图片后缀均可，甚至没有封面名字命名要求，但推荐以视频id为名字)

特殊封面：

- `unknown_poster.jpg` 默认/未知封面



#### avatar

用户头像，没有后缀要求(常见图片后缀均可，但推荐以用户id为名字)

特殊头像：

- `unknown_user.jpg` 默认/未知用户



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



## 用户板块

### 整体结构

#### 用户对象

1. id string 与openid和_id一致
2. _openid string  数据库记录创建时自动生成的
3. name string 要求length不超过20
4. school string 学校信息(选填) 要求length不超过40 暂时不实现
5. motto string 个性签名 要求length不超过80 暂时不实现
6. point number 积分
7. warehouse array(元素为[number, number]) 仓库(商品id+数目)
8. appointment_talk array(元素为date)
9. appointment_vr array(元素为date)
10. star_video array(元素为[string,date])
11. star_post array(元素为[string,date])
12. history_video array(元素为[string,date])
13. history_post array(元素为[string,date])
14. avatar 头像url(完整地址)





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











