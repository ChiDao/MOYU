define(['app'], function(app)
{
  app.factory('UI', ['Modal', function(Modal) {

    return {
      openURL: function(URL){
        window.open(URL, '_system');
      },
      testModal: function(modelName) {
        console.log(modelName);
        Modal.okCancelModal('templates/'+modelName+'.html', {}, {
          init: function(scope){
          }
        });//End of okCancelModal
      }
    }

  }]);

});
