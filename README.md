# school_wall（前端）

#### 介绍
个人作品： 安康学院校园墙-前后端（小程序前端）

感谢 微慕小程序开源版-WordPress版微信小程序，详见开源项目：https://github.com/iamxjb/winxin-app-watch-life.net

项目技术笔记：https://ding-f.gitee.io/2022/02/13/java-bi-ye-she-ji-kai-fa-bi-ji.html

欢迎大家参观我的私人博客：https://ding-f.gitee.io/

**项目本来想着写出来创业的，但后来发现创业挺不容易的，毕业就先想着工作，就先不写了，但奈何换了好几家公司，找不到一份满意的工作，开源是为了技术的进步，结交更多的技术好友。** 

#### 软件架构
软件架构说明

● 本项目是结合学校课程所学用SSM框架开发的一个校园内部信息交流平台，但由于平时同学之间使用的软件基本上都是移动端进行校园信息交流，为提升自身技术水平，决定大三的第一学期去实习学习新的技术来升级项目所需。
● 实习后，决定用所学技术来重写自己的项目。后端选用Maven管理所需依赖，Spring Boot快速启动并配置Spring、SpringMVC、MyBatis Plus。实现前后端分离，RESTful API规范设计接口增删改查，API管理工具使用Swagger。安全框架整合Shiro-Redis + JWT方式实现认证管理、权限管理需求，并整合前端小程序登陆注册逻辑处理。数据库使用MySql + Redis，数据库设计使用Workbench仿照WordPress数据库设计规范重新设计了整个项目的数据库。
● 前端开发微信小程序，前后端数据交互使用Json进行。前期使用WXML、WXSS界面设计，后期选用Vant作为小程序界面设计的组件库，使用Vant过程中遇到很多问题，自行进行了修复并选择最合理的方式处理。JavaScript写小程序逻辑处理并与后端交互数据。
● 后端独立设计文件存储服务器，文件存储使用企业方式进行设计，发布墙贴时文件上传将文件存储信息保存相对路径+帖子时间+文件名称方式存储在数据库。前端需要获取资源会将文件信息数据拼接成文件下载路径，并成功展示在小程序端。

 **目前正在找工作，有工作了或等我后期有时间补全。。。** 

#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
