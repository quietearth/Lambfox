require.config({
   shim: {
      'jquery': { 
         exports: ['$', '$.widgets']
      },
      'jquery.ui': { 
         deps: ['jquery']
      },
      'jquery.tmpl': { 
         deps: ['jquery']
      },
      'jquery.validate': {
         deps: ['jquery']
      },
      'underscore': { 
         exports: '_'
      },
      'backbone': { 
         deps: ['underscore', 'jquery'],
         exports: 'Backbone'
      },     
      'bootstrap': { 
         deps: ['jquery']
      },
      'pubsub': {
         deps: ['jquery']
      },
      'jquery.balloon': {
         deps: ['jquery']
      },               
      'tane.base': { 
         deps: ['jquery', 'jquery.ui', 'jquery.tmpl', 'underscore', 'backbone', 'pubsub', 'backbone.localstorage', 'tane.utils'],
         exports: 'tane'
      },
      'tane.controller': { 
         deps: ['tane.base']
      },
	   'tane.services': {
         deps: ['tane.base'],
         exports: 'TaneServiceBase'
      },
      'tane.ui.widgets': {
         deps: ['tane.base', 'jquery.balloon']
      },      
      'tane.ui.base': {
         deps: ['tane.base'],
         exports: 'TaneBaseView'
      },      
      'tane.ui.widget.manager': {
         deps: ['tane.base', 'tane.ui.widgets']
      },
      'tane.ui.applauncher': {
         deps: ['tane.base', 'tane.ui.widgets']
      },
	   'tane.firebase': {
         deps: ['tane.base', 'tane.services', 'firebase']
      },
      'tane.dbmgr':{
         deps: ['tane.firebase' ]
      }      
   },
   paths: {
      'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
      'jquery.ui': '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min',
      'jquery.tmpl': '/js/jquery-tmpl.min',
      'jquery.validate': '/js/jquery.validate.min',
      'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
      'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min',
      'backbone.localstorage': '//cdnjs.cloudflare.com/ajax/libs/backbone-localstorage.js/1.1.16/backbone.localStorage-min',
      'bootstrap': 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min',
      'pubsub': '/js/pubsub',
      'jquery.balloon': '/js/jquery.balloon',
      'tane.utils': '/js/tane-utils',
      'tane.base': '/js/tane-base',
      'tane.ui.applauncher': '/js/tane-applauncher',      
      'tane.controller': '/js/tane-controller',
      'tane.ui.widget.manager': '/js/tane-widgetmanager',      
	   'tane.services': '/services/tane-services',
      'tane.ui.widgets': '/guis/tane-ui-widgets',
      'tane.ui.base': '/ui-parts/tane-ui-base',
      'firebase': 'https://www.gstatic.com/firebasejs/4.2.0/firebase',      
	   'tane.firebase': '/services/tane-service-firebase',      
      'tane.dbmgr': 'services/tane-service-dbmgr'
   }
});

require([
  'tane-app',     
  ], 
  function (App) {
     App.initialize();
  }
);

define( 'tane-app',
   [
   'jquery', 
   'jquery.ui', 
   'jquery.tmpl',
   'jquery.validate', 
   'underscore', 
   'backbone', 
   'bootstrap',
   'pubsub',
   'tane.utils',
   'tane.base',
   'tane.controller',
	'tane.services',
   'tane.ui.widgets',
   'tane.ui.base',
   'tane.ui.widget.manager',
   'tane.ui.applauncher',
   'tane.dbmgr'
   ], 
   function ($){
      var initialize = function(){
         $(document).ready(function(){
            $( "#main" ).TaneAppLauncher({ 
               name:'launcher', 
               template:'/templates/lambfox.template', 
               project:'lambfox2' 
            });
         });
      }
      return {initialize: initialize};
   }
);
