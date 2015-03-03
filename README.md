#說明文檔

## 準備工作

```
npm install cordova-icon -g
npm install cordova-splash -g  
brew install ImageMagick  
npm install
```

## 項目編譯

**增加平台，注意 iOS 平台需指定版本，否則 url schema 的處理不正常**

```
cordova platforms add ios@3.6.3 android
```

### 運行：

##### iOS：
用 xcode 開啟項目且編譯執行

```
xed platforms/ios/Gamo.xcodeproj/
```

##### Android：
用 ADT 開啟項目且編譯執行

## 頁面編碼

##### 開啟 gulp watch，智慧轉碼 jade,scss。
 
```
gulp watch
```
 
##### 開啟 ionic reload。

```
ionic serve
或    
ionic emulate ios --target="iPhone-5" -l -c -s
```

### 檔案路徑：
 1. jade文件路徑：www_pre/jade
 2. scss文件路徑：www_pre/scss
 
## 環境問題

##### /bin/sh: cordova: command not found

```
sudo npm cache clear  
npm install -g cordova
```


## FAQ

* ionic emulate 會導致 ionic.Platform.isWebView 把模擬器當成為真機。