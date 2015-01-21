define(['app'], function(app)
{
  app.factory('ApiData', ['RestRoute', '$timeout', 'Auth',

  	//Todo: 根据配置进行处理
  	// var resourceConfig = {

  	// }

  	function(RestRoute, $timeout, Auth) {
  		var datas = {};
  		var next = {};

		return {
			all: function(resourceName){
				console.debug(datas[resourceName]);
				return datas[resourceName];
			},
			init: function(resourceName){
				var tmp = {};
				datas[resourceName] = [];
				next[resourceName] = undefined;
				return Thenjs(function(defer){
					RestRoute.getLinkData('/user-subscriptions/' + Auth.currentUser().userData._id + '?_last', tmp, resourceName).then(function(){
						_.forEach(tmp[resourceName], function(resourceData){
							datas[resourceName].push(resourceData);
							//Todo: 可配置化
							RestRoute.getLinkData(resourceData.clip, resourceData, 'clipData').then(function(){
          					});
						})
						next[resourceName] = tmp[resourceName].meta.next;
						console.debug(datas[resourceName]);
						defer(undefined);
					}, function(){
						defer("Init resource error");
					});
				});
			},
			// refresh: function(resourceName){
			// 	var tmp = {};
			// 	if (next[resourceName]){
			// 		RestRoute.getLinkData('/user-subscriptions' + Auth.currentUser().userData._id + '?_last', tmp, resourceName).then(function(){
			// 			datas[resourceName] = datas['user-subscriptions'].concat(tmp.subscribes);
			// 		}, function(){
			// 		});
			// 	}
			// }
		}
  	}
  ]);
});