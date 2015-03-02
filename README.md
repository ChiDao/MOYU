#說明文檔

## 準備工作

```
npm install cordova-icon -g
npm install cordova-splash -g  
brew install ImageMagick  
npm install
```

##项目编译

**增加平台，注意 iOS 平台需指定版本，否则 url schema 的处理不正常**

```
cordova platforms add ios@3.6.3 android
```

### 打开项目并运行

##### iOS
用xcode打开项目并编译执行

```
xed platforms/ios/Gamo.xcodeproj/
```

##### Android
用ADT打开项目并编译执行

##页面开发

##### 打开 gulp watch，自动转换 jade,scss
 
```
gulp watch
```
 
##### 打开ionic reload

```
ionic serve
```

### 文件路径
 1. jade文件路径：www_pre/jade
 2. scss文件路径：www_pre/scss
 
## 環境問題
根據以下處理

##### /bin/sh: cordova: command not found

```
sudo npm cache clear  
npm install -g cordova
```