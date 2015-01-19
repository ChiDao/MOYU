#前提条件

```bash
npm install cordova-icon -g
npm install cordova-splash -g
brew install ImageMagick
npm install
```


##项目编译

###增加平台，注意ios平台需指定版本，否则url schema的处理不正常

```bash
cordova platforms add ios@3.6.3 android
```

###打开项目并运行

####ios，用xcode打开项目并编译执行

```bash
xed platforms/ios/Gamo.xcodeproj/
```

####android，用ADT打开项目并编译执行

##页面开发

###打开gulp watch，自动转换jade,scss
 
 ```bash
 gulp watch
 ```
 
###打开ionic reload

```bash
ionic serve
```

###文件路径：
 1. jade文件路径：www_pre/jade
 2. scss文件路径：www_pre/scss
 
