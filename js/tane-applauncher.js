/////////////////////////
// Simple Application Launcher
/////////////////////////
   $.widget("tane.TaneAppLauncher", $.tane.base, {   
   // Initialize
      init: function(){
         this.addGlobalEventHandler('*', this.appLauncherGlobalEventHandler);
         this.isWidgetManagerReady = false;
         startjQWidget(
            "TaneConfigMgr", 
            "{project:'" +this.options.project+"', appname:'"+this.AppName+"'}", 
            "main"
         );  
         startjQWidget(
            "TaneController", 
            "{name:'controller', appname: '"+this.AppName+"'}", 
            "main"
         );  
         startjQWidget(
            "TaneWidgetManager", 
            "{name:'"+this.widgetManager+"', template:'templates/widgetmanager.template', type:'general', appname:'"+this.AppName+"'}", 
            "main"
         );  

         this.pubGlobalEvent("public/do/lambfoxbase/get?pathname=apps/"+this.AppName);
      }, 
      globalEventFilter: function(event, model, option){
         if(event.eventName()=="ready" && event.originName()!=this.widgetManager) return false;
         return true;
      },
	   appLauncherGlobalEventHandler: function(event, model, option){
	      var op = event.eventName();
         switch(op){
      	case 'set':
      	   this.model = model;
      	   if(!this.wid){
         	   var template = model.getData("template");
         	   this.changeTemplate(template, this.locationID);
         	}
      	   if(!this.isWidgetManagerReady)
      	   break;
      	case 'ready':
      	   this.launchWidgets(this.model.getData("init"));            
            this.isWidgetManagerReady = true;
      	   break;
      	}
      },
      launchWidgets(array){
        	if(array){
         	Object.keys(array).forEach(function(key){
         	   var section = array[key];
               this.pubGlobalEvent("public/do/"+this.widgetManager+"/start?name="+key, null, section);
      	   }, this);
      	}
      }
   });