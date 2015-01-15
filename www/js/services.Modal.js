define(['app'], function(app)
{
  	app.service('Modal', function ($ionicModal, $rootScope) {
    
	  var okCancelModal = function(template, options, eventHandles){
	  	options = options || {};
	  	var scope = $rootScope.$new();
	  	eventHandles.init? (function(){
	  		  		console.debug('OkCancleModal init');
	  		  		eventHandles.init(scope)
	  		  	})(): undefined;
	  	options.scope = scope;
	  	return Thenjs(function(defer){
	  		$ionicModal.fromTemplateUrl(template, options).then(function(modal) {
	  			scope.modal = modal;
			  	scope.ok = function(form){
			  		console.debug('OkCancleModal ok');
			  		if (_.isFunction(eventHandles.onOk)){
			  			eventHandles.onOk(form, scope);
			  		}else{
			  			modal.hide();
			  		}

			  	}
			  	scope.hideModal = function(){
			  		modal.hide();
			  	}
			  	scope.closeModal = function(){
			  		console.debug('OkCancleModal closeModal');
			  		if (_.isFunction(eventHandles.onClose)){
			  			eventHandles.onClose(scope);
			  		}else{
			  			modal.hide();
			  		}
			  	}
			  	scope.cancelModal = function(){
			  		console.debug('OkCancleModal cancelModal');
			  		if (_.isFunction(eventHandles.onCancel)){
			  			eventHandles.onCancel(scope);
			  		}else{
			  			modal.hide();
			  		}
			  	}
	  			modal.show();
	  			defer(undefined, scope, modal);
	  		});
	  	});
	  }

	  return {
	    okCancelModal: okCancelModal,
	  };
  });
});
