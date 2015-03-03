
define(['app', 'restangular'], function(app){

  app.config(function(RestangularProvider, ApiProvider) {

      RestangularProvider.setDefaultHeaders({
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
      });
      RestangularProvider.setDefaultHttpFields({
        withCredentials: true
      });

      RestangularProvider.setFullResponse(true);

      // RestangularProvider.setBaseUrl('http://api.gamo.mobi');
      // ApiProvider.setBaseUrl('http://api.gamo.mobi');
      // RestangularProvider.setBaseUrl('http://42.120.45.236:8485');
      // ApiProvider.setBaseUrl('http://42.120.45.236:8485');


      // add a response intereceptor
      RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        var extractedData;      // .. to look for getList operations
        // console.debug('data:' + JSON.stringify(data));
        if (operation === "getList") {
          // .. and handle the data and meta data
          extractedData = data.slice?data.slice:[];
          extractedData.meta = _.pick(data, function(value, key){
            return key !== 'slice';
          });
        } else {
          extractedData = data;
        }
        return extractedData;
      });


      RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        if (response.headers('my-xsrf-header')){
          localStorage.setItem('my-xsrf-header', response.headers('my-xsrf-header'));
        }

        if (operation === "getList") {
          return data;
        } else {
          return {rawData: data};
        }
      });

      RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig ) {
        if(localStorage.getItem('my-xsrf-header')){
          headers.Authorization = 'Bearer '+ localStorage.getItem('my-xsrf-header');
        }
        return {
          element: element,
          params: _.extend(params, {single: true}),
          headers: headers,
          httpConfig: httpConfig
        };
      });
    ApiProvider.setServerApis({
      gamoApis: {
        isDefault: true,
        baseUrl: 'http://42.120.45.236:8485',
        id: '_id',
        createStreamMeta: false,
        lastOrder: 'asc',
        streamMeta: {
          last: ["last", "_last="],
          first: ["first", "_first="],
          next: ["next", "_next=<% metaParam %>"],
          prev: ["prev", "_prev=<% metaParam %>"]
        },
        apisSetting: [
          //Entity
          ['object', 'user', [['userId'],{}]],
          ['object', 'game', [['gameId'],{}]],
          ['object', 'clip', [['clipId'],{}]],
          //User
          ['object', 'user-profile', [['user'],{}]],
          ['stream', 'signup', [[],{}]],
          ['stream', 'login', [[],{}]],
          ['object', 'home', [[],{}]],
          ['object', 'me', [[],{}],{'_id':'$currentUser'}],
          ['stream', 'event-user', [['user'],{}],{'user':'$currentUser'}],
          //game client
          ['stream', 'game-clients', [['game'],{}]],
          ['object', 'follow-game', [['game', 'user'],{}],{'user':'$currentUser'}],
          ['stream', 'recent-played-games', [['user'],{}],{'user':'$currentUser'}],
          ['stream', 'clients-by-platform', [['platform'],{}]],
          //clip comments
          ['stream', 'new-clip', [['game'],{}],{'user':'$currentUser'}],
          ['stream', 'game-clips', [['game'],{}]],
          ['stream', 'user-clips', [['user'],{}]],
          ['stream', 'user-interests', [['user'],{}]],
          ['object', 'follow-clip', [['clip', 'user'],{}],{'user':'$currentUser'}],
          ['query', 'recent-user-subscriptions', [['user'],{}],{'user':'$currentUser'}],
          ['stream', 'clip-comments', [['clip'],{}]],
          ['object', 'new-comment', [['clip'],{}],{'user':'$currentUser'}],
        ],
        apiRouteMaps:[
          ['recent-played-games',{'default': 'tab.channels'}],
          ['recent-user-subscriptions', {'default': 'tab.chats'}],
          ['me', {'default': 'tab.profile'}],
          ['game', {'default': 'tab.channel'}],
          ['clip', {
            'default': 'tab.chat',
            'channels': 'tab.channel-chat',
            'chats': 'tab.chat',
            'profile': 'tab.profile-chat',
          }],
        ],
        apiModals: [
          ['signup', 'templates/modal-signup.html', {tel: ''}],
          ['login', 'templates/modal-login.html', {password: ''}],
          ['new-clip', 'templates/modal-new-clip.html'],
        ],
        apiResources:[
          ['new-comment','clip', 'clip'],
        ]
      },
      // contentApis: {
      //   isDefault: true,
      //   baseUrl: 'http://fff.gaeamobile.net/mobileApi',
      //   // baseUrl: 'http://www.freehome.com/mobileApi',
      //   id: "id",
      //   createStreamMeta: true,
      //   lastOrder: 'desc',
      //   streamMeta: {
      //     last: ["_last", "_last=1"],
      //     first: ["_first", "_first=1"],
      //     next: ["_next", "_next=<% metaParam %>"],
      //     prev: ["_prev", "_prev=<% metaParam %>"]
      //   },
      //   // api type | api name | api params
      //   apisSetting: [
      //     ['stream', 'getArticles', [[],{}]],
      //     ['object', 'getArticleById', [['articleId'],{}]],
      //     ['object', 'getArticleCatalog', [[],{}]],
      //     ['stream', 'getVideos', [[],{}]],
      //     ['object', 'getVideoById', [['videoId'],{}]],
      //     ['object', 'getVideoCatalog', [[],{}]],
      //     ['stream', 'getHeros', [[],{}]],
      //     ['object', 'getHeroInfoById', [['heroId'],{}]],
      //     ['stream', 'getHeroSkillById', [['heroId'],{}]],
      //     ['object', 'getHeroEquipmentById', [['heroId'],{}]],
      //     ['object', 'getHeroTalentById', [['heroId'],{}]],
      //     ['stream', 'getHeroGuideById', [['heroId'],{}]],
      //     ['object', 'getHeroType', [[],{}]],
      //     ['stream', 'getEquipments', [[],{}]],
      //     ['object', 'getEquipmentById', [['equipId'],{}]],
      //     ['stream', 'getEquipmentType', [[],{}]],
      //     ['stream', 'getHolyStoneType', [[],{}]],
      //     ['stream', 'getHolyStoneRank', [[],{}]],
      //     ['stream', 'getHolyStonesByType', [['stoneType'],{}]],
      //   ],
      // }
    });
  });
});
