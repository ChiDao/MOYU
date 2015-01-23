define(['app', 'services.Api'], function(app)
{
  app.factory('ApiData', ['$http', 'Api', 

  	function($http, Api) {

  		var baseUrl = Api.baseUrl;
  		var apis = Api.apis;

  		var datas = {};
  		var next = {};

  		var getData = function(link, shouldAddRandom){
  			var apiData = Api.parse(link);
  			var newLink = baseUrl + '/' + _.template(apiData.api.api, apiData.params);
  			if (shouldAddRandom){
  				newLink += (/\?/.test(newLink)? '&':'?') + 'r=' + Math.random();
  			}
  			console.debug(newLink);
  			// $http({
  			// 	method:'GET',
  			// 	url: baseUrl + ,
  			// 	withCredentials: true,
  			// 	headers: {
  			// 		'Content-Type': 'application/json',
  			// 		'X-Requested-With': 'XMLHttpRequest'
  			// 	}
  			// }).success(function(data){
  			// })
  		}

  		getData('http://42.120.45.236:8485/game/14a092378763812c', true);

		return {
		}
  	}
  ]);
});



			// all: function(resourceName){
			// 	// console.debug(datas[resourceName]);
			// 	return datas[resourceName];
			// },
			// init: function(resourceName){
			// 	var tmp = {};
			// 	datas[resourceName] = [];
			// 	next[resourceName] = undefined;

			// 	//检测是否有缓存
			// 	var localSubscriptions = localStorage.getItem('subscriptions');
			// 	if (localSubscriptions !== null){
			// 		return Thenjs(function(defer){
			// 			console.log('Read subscriptions from localStorage.');
			// 			_.forEach(JSON.parse(localSubscriptions), function(subscription){
			// 				ApiEvent.registerByResource('clip', subscription.clipData._id, function(event){
			// 					console.debug("update Comment Count" +subscription.clipData.newCommentCount);
			// 					subscription.clipData.newCommentCount++;
			// 				});;
			// 				datas[resourceName].push(subscription);
			// 			})
			// 			// localStorage.removeItem('subscriptions');
			// 			// console.debug("Read subscriptions from localStorage", datas[resourceName]);
			// 			defer(undefined);
			// 		});
			// 	}else{
			// 		return Thenjs(function(defer){
			// 			RestRoute.getLinkData('/user-subscriptions/' + Auth.currentUser().userData._id + '?_last', tmp, resourceName).then(function(){
			// 				async.each(tmp[resourceName], function(resourceData, callback){
			// 					datas[resourceName].push(resourceData);
			// 					//Todo: 可配置化
			// 					RestRoute.getLinkData(resourceData.clip, resourceData, 'clipData').then(function(){
			// 						console.debug("get clipData", resourceData.clipData);

			// 						//获取最后一个comment
			// 						var tmpData = {};
			// 						RestRoute.getLinkData('/clip-comments/' + resourceData.clipData._id + '?_last', tmpData, 'tmpData').then(function(){
			// 							resourceData.clipData.lastComment = tmpData.tmpData.pop();
			// 							// console.debug("registerByResource" + resourceData.clipData._id)
			// 							resourceData.clipData.newCommentCount = 0;
			// 							ApiEvent.registerByResource('clip', resourceData.clipData._id, function(event){
			// 								console.debug("update Comment Count" +resourceData.clipData.newCommentCount);
			// 								resourceData.clipData.newCommentCount++;
			// 							});

			// 							callback(undefined);
			// 						});
	  //         					});
			// 				}, function(){
			// 					next[resourceName] = tmp[resourceName].meta.next;
			// 					console.debug(datas[resourceName]);
			// 					defer(undefined);
			// 				});
			// 			}, function(){
			// 				defer("Init resource error");
			// 			});
			// 		}).then(function(defer){
			// 			console.log('Save subscriptions to localStorage');
			// 			localStorage.setItem('subscriptions', JSON.stringify(datas[resourceName]));
			// 			defer(undefined);
			// 		});
			// 	}
			// },
			// refresh: function(resourceName){
			// 	console.log("Refresh apiData: " + resourceName);
			// // 	var tmp = {};
			// // 	if (next[resourceName]){
			// // 		RestRoute.getLinkData('/user-subscriptions' + Auth.currentUser().userData._id + '?_last', tmp, resourceName).then(function(){
			// // 			datas[resourceName] = datas['user-subscriptions'].concat(tmp.subscribes);
			// // 		}, function(){
			// // 		});
			// // 	}
			// }