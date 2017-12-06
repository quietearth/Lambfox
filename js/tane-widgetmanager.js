	
   // Widget Manager
   $.widget("tane.TaneWidgetManager", $.tane.SimpleUI, {
   	sysReservedName: 'widgetManager',
      // activeWidgets table format -- { widgetname: wid }
      activeWidgets: {},
	   // availableWidgets format -- { widgetname: { plugin, template, options, icon } }
	   availableWidgets: {},
	   availableAPIs: {},
	   // widgetHistory format -- { section: [ [widgetname, ...], ...] }
	  
      init: function(){
         this.activeWidgets = new TaneTable();
         this.availableWidgets = new TaneTable();
         this.availableAPIs = new TaneTable();
         this.datalist.push("widgetInfo");
         this.addGlobalEventHandler('*', this.widgetManagetGlobalEventHandler);
         this.numInitEvents = 2;
         this.pubGlobalEvent("public/do/lambfoxbase/get?pathname=widgets");
         this.pubGlobalEvent("public/do/lambfoxbase/get?pathname=apis");
	   },
      preLocalEventListener: function(event, data, xevent){},	   
      localEventListener: function(event, data, xevent){
         switch(event.eventName()) {
         case "selectableSelect":
			   var wid = data.getDataValue('wid');
			   var widgetName = data.getDataValue('name');
		      this.pubGlobalEvent('public/do/'+widgetName+'/show?id='+wid, '');
            break;
         }
      },
	   widgetManagetGlobalEventHandler: function(event, data, option){
	      var op = event.eventName();
	      var widgetName = event.originName();
         var model = new TaneModel(widgetData);         
         switch(op){
      	case 'start':
      	   var section = option && option.split(';')[0];
      	   var startOption = option && option.split(';')[1];
      	   this.pubGlobalEvent('public/do/*/hide', data, section);
	         var widgetName = event.getParm('name');	
		   	this.startWidget(widgetName, section, startOption);		   
            break;
         case 'terminated':
            var widgetData = this.availableWidgets.get("widgetName", widgetName) || this.availableAPIs.get(widgetName);
		      if(widgetData) this.pubLocalEvent('local/do/guis/remove', data);
            break;
		   case 'initialized':
            var widgetData = this.availableAPIs.get(widgetName);
            this.setWidgetHistory(widgetName, option);
 	         break;			
	      case 'getVisible':
            this.setWidgetHistory(widgetName, option);
            break;
	      case 'getInvisible':
	         var widgetData = this.availableWidgets.get("widgetName", widgetName);
            break;
		   case 'add':
		   case 'set':
		      var attr = data.getData();
            Object.keys(attr).forEach(function(key){
               var conf = attr[key];
               if(conf.type && conf.type == "api") this.availableAPIs.push(key, conf);
               else if(conf.type && conf.type == "gui") this.availableWidgets.push(key, conf);
            }.bind(this));
            if(this.numInitEvents-1==0) this.pubGlobalEvent("public/do/*/ready");       
            this.numInitEvents = this.numInitEvents-1;
				break;
		 	case 'startWithEvent':
		      var orgEvent = event.attr("event");
		      var d = orgEvent.destination();
		      if(d=='*' || d=='na' || d==this.options.name) break;
		      var widgetdef = this.availableWidgets.get("widgetName",d);
		      if(!widgetdef) break;
	         var eid = option || widgetdef.eid;
	         var section = eid && eid.split(';')[0];
     	      var startOption = eid && eid.split(';')[1];
     	      this.pubGlobalEvent('public/do/*/hide', data, section);
	         this.startWidget(d, section, startOption);
		   	this.pubGlobalEvent(orgEvent, data, startOption);
            break;
		 	case 'getBack':
		 		if(!option) break;
		 	   var history = this.activeWidgets.get(option);
		 	   var l = history.length;
	 	      if(l>1) var widgetName = history[l-2];
	 	      else if(l==1) var widgetName = history[0];
	 	      else return;
	 	      this.pubGlobalEvent('public/do/*/hide', data, option);
	 	      this.pubGlobalEvent('public/do/'+widgetName+'/show', data, option);
		 	   break;
		 	default:
            break;
		   } // endcase
	   }, // end of globalEventListener
	   
  	   startWidget: function(widgetname, section, startOption){
  	      if(this.isRunning(widgetname, section)){
            this.pubGlobalEvent('public/do/'+widgetname+'/show', null, section);
  	      	return;
  	      }
  	      var widgetDef = this.availableAPIs.get("widgetName", widgetname) || this.availableWidgets.get("widgetName", widgetname);
  	      if(widgetDef) var type = "api";
  	      else var type = "gui";
		   if(!widgetDef) return;
		   var plugin = widgetDef.pluginname;
		   var templatename = widgetDef.template;
         var iconname = widgetDef.icon;
         var options = widgetDef.option;

         var jsfile = widgetDef.jsFile;
         var opt = "{name:'"+widgetname+"'";
         if(templatename) opt+=", template:'"+templatename+"'";
         if(options) opt+=","+options;
         opt+=",icon:'"+iconname+"', widgetManager:'"+this.options.name+"'}";
         startjQWidget(plugin, opt, section, jsfile, widgetDef.deps);
	   },
	   setWidgetHistory: function(name, section){
	     	var history = this.activeWidgets.get(section);
  	      if(!history){
  	         var history = [];
  	         history.push(name);
  	      }else{
  	         if(history.indexOf(name)>=0)
  	         	history.shift(name);
  	         history.push(name);
  	      }
         this.activeWidgets.push(section, history);
         return
	   },
	   isRunning: function(name, id){
	      if(id){
	         var history = this.activeWidgets.get(id);
	         if(history && history.indexOf(name) >= 0) return true;
	         else return false;
	      }else{
	      	Object.keys(this.activeWidgets).forEach(function(key){
   	   		var history = this.activeWidgets.get(key);
	   	   	if(history && history.indexOf(name)>=0) return true;
		      }.bind(this));
		      return null;
		   }
	   },
   });
