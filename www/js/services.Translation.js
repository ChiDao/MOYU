define(['app', 
	'angular-cookies', 
	'angular-translate-storage-local', 
	'angular-translate-storage-cookie',
	'angular-translate-handler-log',
	'angular-translate'
	], function(app)
		{
		    app.provider('Translations', function($translateProvider) {
				var translationsCN = {
				  preregister: '预注册',
				  preregister2: '今・事前登録',
				  intro:'介紹',
				  trunc:'截圖',
				  gift:'禮包',
				  DOTA:'歡樂聖誕節就要來啦!各位冰友們~ 準備好一同來瘋刀塔了嗎? 在這歡樂的佳節中，《刀塔傳奇》除了準備豐富的遊戲活動，還有諸多精彩的合作活動等玩家們一同來挖掘！活動名稱：刀塔傳奇送祝福！分享簽名檔！領取400萬鑽石聖誕好禮！',
				  official_web:'査察官網',
				  email:'郵件地址',
				  close:'关闭',
				  cancel:'取消',
				  email_placeholder:'貴方的電子郵件地址',
				  email_form:'郵件格式？',
				  next:'下一步',
				  captcha:'验证码',
				  captcha_prompt:'請輸入郵件收到的驗證碼',
				  open_notification:'開啟通知',
				  complete:'完成',
				  caution:'Gamo App 需要通知權限來與遊戲協作。<br>通知功能是 Gamo App 必不可少的功能組成，在缺乏此功能下，<b>將無法開啟 App</b>。',
				  finish_open:'下一步',
				  wait_service:'等待開服',
				  promotion:'置顶',
				  raider_articles:'全部攻略文章',
				  share:'分享給好友',
				  about:'關於',
				  agreement:'用戶協議',
				  privacy:'隐私政策',
				};
				 
				var translationsJP= {
				  preregister: '予備登録',
				  // intro:'紹介',
				  // gift:'福袋',
				  // trunc:'截図',
				  // email:'電子メール',
				  // complete:'完成',
				};

				this.translateConfig = function(){
					$translateProvider.translations('jp', translationsJP);
					$translateProvider.translations('cn', translationsCN);
						 // $translateProvider.useMessageFormatInterpolation();
						 $translateProvider.preferredLanguage('jp');
					//	 $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
						 $translateProvider.fallbackLanguage(['jp', 'cn']);
						 $translateProvider.useLocalStorage();
						 //$translateProvider.useMissingTranslationHandlerLog();
						 $translateProvider.useSanitizeValueStrategy('escape');
						 return ;
						};

				this.$get = function() { 
					return {}
				}	
			})


});
