define(['app', 'services.Api'], function(app)
{
  app.classy.controller({
    name: 'TabsCtrl',
    inject: ['$scope', '$state', '$timeout', 'ApiEvent', 'Auth', 'Api'],
    init: function(){
      this.$scope.Api = this.Api;
      //处理新增评论事件
      this.checkedNewEvent();
      this.ApiEvent.registerByApi('new-comment', function(event){
        if (this.$state.current.name === 'tab.chat' || this.$state.current.name === 'tab.chats'){
          this.ApiEvent.updateEventId();
          this.$scope.badgeContent = '';
        }else{
          this.checkedNewEvent();
        }
      });
    },
    methods: {
      checkedNewEvent: function(){
        this.ApiEvent.checkedNewEvent().then(function(defer, hasNewEvent){
          $scope.badgeContent = hasNewEvent?'+':'';
        });
      },
      homeData: function(tab){
        // if(!Auth.isLoggedIn()){
        //   if (tab === "game") return;
        //   Auth.login(function(){
        //       $scope.$broadcast('log-in', true);
        //   });
        // }else{
        return this.Auth.currentUser().userData.homeData;
        // }            
      },
      hideTabs: function(){
        //根据路由判断是否清理badge
        switch (this.$state.current.name) {
          case 'tab.chat':
          this.$scope.badgeContent = '';
          break;
          case 'tab.chats':
          this.$scope.badgeContent = '';
          break;
          default:
        };
        //根据路由判断是否显示Tabs
        switch (this.$state.current.name) {
          case 'tab.channel':
          return true;
          case 'tab.chat':
          return true;
          case 'tab.channel-chat':
          return true;
          case 'tab.profile-chat':
          return true;
          default:
          return false;
        }
      }
    }
  });

});