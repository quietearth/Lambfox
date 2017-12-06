///////////////////////////////////////////
// Controler prototype
///////////////////////////////////////////
(function($) {
// Base widget difinition
   "use strict";
   $.widget("tane.base", {
      options: {
         objectlist: [
            {elementType: '.textinput',	  compName: 'SimpleTextInput',      jsFile:'/ui-parts/tane-simple_input'},
            {elementType: '.simple_button', compName: 'SimpleButton',         jsFile:'/ui-parts/tane-simple_button'},
            {elementType: '.static_element',compName: 'SimpleStaticElement',  jsFile:'/ui-parts/tane-static_element'},
            {elementType: '.selector', 	  compName: 'SimpleSelectMenu',     jsFile:'/ui-parts/tane-simple_selectmenu'},
            {elementType: '.selectable', 	  compName: 'SimpleSelectableList', jsFile:'/ui-parts/tane-simple_selectable'},
            {elementType: '.indexarray', 	  compName: 'IndexedArrayList',     jsFile:'/ui-parts/tane-indexed_array'},     
            {elementType: '.spinner', 		  compName: 'SimpleSpinner',        jsFile:'/ui-parts/tane-simple_spinner'},
			   {elementType: '.simple_viewer', compName: 'SimpleViewer',         jsFile:'/ui-parts/tane-simple_viewer'},
   			{elementType: '.google_map',    compName: 'GoogleMap',            jsFile:'/ui-parts/google_map'},
	   		{elementType: '.simple_modal',  compName: 'SimpleModal',          jsFile:'/ui-parts/tane-simple_modal'},
	   		{elementType: '.simple_dialog', compName: 'SimpleDialog',         jsFile:'/ui-parts/tane-simple_dialog'},
		   	{elementType: '.camera',		  compName: 'SimpleCamera',         jsFile:'/ui-parts/tane-simple_camera'},
		   	{elementType: '.form_validate', compName: 'FormValidator',        jsFile:'/ui-parts/tane-form_validator'},
		   	{elementType: '.bitmovinplayer',compName: 'SimpleBitmovinPlayer', jsFile:'/ui-parts/tane-bitmovin_player'},
		   	{elementType: '.vrviewplayer',  compName: 'VRViewPlayer',         jsFile:'/ui-parts/tane-vr_view'},  			   	
		   	{elementType: '.simple_accordion', compName: 'SimpleAccordion',   jsFile:'/ui-parts/tane-simple_accordion'}
         ]
      },
   });

   // System Event Filter
   // System Event filters returns false when;
   //  - match all of the FilterList condition.
   //    origin: originator name
   //    event: event name
   //    parm: parameter specified
   //    destination: widget name 
   //  - destination not any of the following
   //    - wildcard '*'
   //    - widget name to apply this condition(not destination in the event)
   //  - "!" means "if not".
   var FilterList = [
       {origin: "firebase", parm: "apistore",  destination: "widgetManager", value: "false"},
       {origin: "firebase", event: "^.*close", value: "false" },
		 {origin: "/firebase/", parm: "/!oauthprovider/", destination: "/Login/"}		  		 
   ]   

// Initialization & destroy
   $.tane.base.prototype._init = function(){
      var name = this.options.name;
      this.locationID = this.element.attr("id");
      this.globalEventHandlers = new Array();
      this.Adapters = new Array();
      this.pendingEvents = new Array();

      _.bindAll(this, 'catchDroppedItem', 'changeSize', 'getInvisible', 'globalEventListener', 'localEventListener' );

      this.loadTemplate(this.options.template, this.locationID);
      this.AppName = this.options.appname || $("#"+this.wid).closest(".tane-app").attr("id");
      this.widgetManager = "widgetManager";

      if(this.isAPI){
         this.globalPubTopic = this.AppName+"_public_3";
         this.globalSubTopic = this.AppName+"_public_2";      
      }else{
         this.globalPubTopic = this.AppName+"_public_1";
         this.globalSubTopic = this.AppName+"_public_4";      
      }      
      this.localTopic = this.AppName +"_"+ this.options.name+"_local";      
      this.publichub = bindHub(this.globalSubTopic, this.globalSystemEventListener, this, this.options.name );
      this.localhub = bindHub(this.localTopic, this.localSystemEventListener, this, this.options.name);
      this.active = true;           
      if(this.options.initShow == "false") this.getInvisible();
      this.datalist = [];
      
      if(this.dataname)
         this.dataname.split(',').forEach(function(dataname){
            this.datalist.push(dataname);
         }, this);
      this.model = new TaneModel();
      this.model.dataName(this.dataname);
      this.modelStack = new TaneTable();
      
      this.GUIReady = false;
      var d = this.genGUIObjects(this.options.objectlist);
  
      var next = function(){
         if(this.initEvent){
            this.initEvent.split(',').forEach(function(event){
               var dataname = event.split('?')[1];
//               if(dataname) this.datalist.push(dataname);
               this.pubGlobalEvent(event, this.model);
   		   }, this);
	   	}
         if($('#'+this.locationID).hasClass('widgetManager')) var eid = $('#'+this.locationID).attr("x-data-eid");
         else var eid = this.locationID;
         this.eid = eid;
         var data = new TaneModel({"wid":this.wid, "icon":this.options.icon, "name":this.options.name});
         data.dataName("widgetInfo");  
         if(this.sysReservedName != "widgetManager")       
            this.pubGlobalEvent("public/do/"+this.widgetManager+"/initialized", data, eid);  
         this.GUIReady = true;
         while(this.pendingEvents.length>0){
            var e = this.pendingEvents.shift();
            this.globalEventListener(e.topic, e.event, e.model, e.option);
         }
      }.bind(this);
      if(d) d.then(next);
      else next.call();
      
      this.init();    
      this.iconTemplate = loadHtml('icon.template');
   }
   $.tane.base.prototype.init = function(){}

// Load Template
   $.tane.base.prototype.loadTemplate = function(template, id){
      if(!id) id = this.locationID;
      if(template) {
         $('#'+id).append(loadHtml(template));
         var widget_top = $('#'+id).find('.tane-widget-top:first')[0];
         if(widget_top){
            var wid = $(widget_top).attr('id');
            if(!wid) {
               wid = this.options.name;
               $(widget_top).attr('id', wid);
            }
            this.wid = wid;
         }else{
            var wid = id;
         }
         this.initEvent = $('#'+wid).attr('x-init-event');         
         var eventdata = $('#'+wid).attr('x-init-event-data');
         this.initEventData = eventdata ? JSON.parse(eventdata) : {};
         this.initEventOption = $('#'+wid).attr('x-init-event-option');
         this.dataname = $('#'+wid).attr('x-data-dataname');
         var idattr = $('#'+wid).attr('x-data-idAttribute');
         if(idattr) this.model.setIdAttr(idattr);
      }else{
         this.wid = id;
         return null;
      }

      // draggable & droppable
      var array = $("#"+wid).find(".draggable");
      _.map(array, function(elem){
         if(this.isMyOwnElement(elem, wid)) $(elem).draggable();
      }.bind(this));
      var array = $("#"+wid).find(".draggable-x");
      _.map(array, function(elem){
         if(this.isMyOwnElement(elem, wid)) {         
            $(elem).draggable({
               helper: "clone",
            });
         }
      }.bind(this));

      var func = function(event, ui, eid){ this.catchDroppedItem(event, ui, eid) }.bind(this);
      array = $("#"+wid).find(".droppable");
      _.map(array, function(elem){
         if(this.isMyOwnElement(elem, wid)){
           $(elem).droppable({
//            activeClass: "ui-state-hover",
              activeClass: "ui-state-highlight,",
//            hoverClass: "drop-hover",
              drop: function(event, ui){func(event, ui, this.id);},
              greedy: true
           });
         }
      }.bind(this));

      // resizable
      var array = $("#"+wid).find(".resizable");
      _.map(array, function(elem){
         if(this.isMyOwnElement(elem, wid)) $(elem).resizable({stop: this.changeSize.bind(this)});
      }.bind(this));
      
      // hide optional select list
      var array = $("#"+id).find(".selectorrelated");
      _.map(array, function(elem){
         if(this.isMyOwnElement(elem, wid)) $(elem).hide();
      }.bind(this));

      $(".ui-icon-wrench").click(this.widgetSystemOperation.bind(this));
      $(".ui-icon-minus").click(this.widgetSystemOperation.bind(this));
      $(".ui-icon-plus").click(this.widgetSystemOperation.bind(this));
      $(".ui-icon-close").click(this.widgetSystemOperation.bind(this));
   }
   
// Replace the widget's template
   $.tane.base.prototype.changeTemplate = function(template, id){
      if(!template || !id) return false;
      $('#'+id).children().each(function(id, child){
         child.remove();
      });
      this.options.template = template;
      this.loadTemplate(template, id);
      if(this.initEvent){
         this.initEvent.split(',').forEach(function(event){
            this.model.setData();
	   	   this.pubGlobalEvent(this.initEvent, this.model, this.initEventOption);
	   	}, this);
	   }
   }
   
   $.tane.base.prototype._destroy = function(){
      var data = new TaneModel({"wid":this.wid, "icon":this.options.icon, "name":this.options.name});
      data.setIdAttr('name');
      data.dataName("widgetInfo");
      var event = new TaneEvent(this.options.name);
      event.eventName("terminated").destination(this.widgetManager).setParm("name", this.options.name);
      event.eventType("public");
      this.pubGlobalEvent(event, data);
 
      unbindHub(this.publichub, this.options.name);
      unbindHub(this.localhub, this.options.name);

      this.delGUIObjects();
      $('#'+this.wid).remove();
      this.model.clear();
      this.initEvent = '';
      this.initEventData = '';
      this.initEventOption = '';
//       $.Widget.prototype.destroy.call(this);
   }

// Publish Events
   $.tane.base.prototype.publishEvent = function(event, data, topic, option){
      var taneEvent;
	   if(!(event instanceof TaneEvent) && !(event instanceof Object)){
         taneEvent = new TaneEvent(this.options.name);
         if(event.indexOf(';') != -1){
   		   var array = event.split('?')[0].split(';');
            array.forEach(function(elem){
               var name = elem.split('=')[0].trim();
               var value = elem.split('=')[1].trim();
               switch(name){
               case 'type':
      	         taneEvent.eventType(value);      
                  break;
               case 'destination':
      	   	   taneEvent.destination(value);
                  break;
               case 'eventName':
      	         taneEvent.eventName(value);                  
                  break;
               }
            }, this);
         }else{
   		   var array = event.split('?')[0].split('/');
            taneEvent.eventType(array[0]);  		 
	   	   taneEvent.destination(array[2]);
	         taneEvent.eventName(array[3]);
	   	}
	   	var parms = event.split('?')[1];
   	   taneEvent.setStringParms(parms);

    		if(option) taneEvent.attr('option', option);
         else taneEvent.attr('option', ''); 		           
      }else{
         taneEvent = event;
      }
	   this.eventConverter(taneEvent, data, topic, option);
      this.eventMonitor(taneEvent, data, topic, option);
      pubEvent(taneEvent, data, topic, option);
   }
   
   // Global
   $.tane.base.prototype.pubGlobalEvent = function(event, data, option){
	   if(event instanceof TaneEvent || event instanceof Object){
         if(!event.eventType()) event.eventType('public');
      }
      this.publishEvent(event, data, this.globalPubTopic, option);
   }
   
   // Local
   $.tane.base.prototype.pubLocalEvent = function(event, data, option){
	  if(event instanceof TaneEvent || event instanceof Object){
         event.eventType('local');
      }
      this.publishEvent(event, data, this.localTopic, option);
   }
   
// Event Listners
// System Global Event Listener/Dipatcher
   $.tane.base.prototype.globalSystemEventListener = function(topic, event, model, option){
      simpleLogger("Listener@"+this.options.name, topic, event, model, option);
      var flg = true;
      if(model instanceof TaneModel){
         var model2 = new TaneModel(model.getData());
         model2.dataName(model.dataName());
      }else var model2 = clone(model);
       
      if(model) model2.setIdAttr(model.getIdAttr());
      if(!this.preGlobalEventFilter(topic, event, model2, option, flg)){
      	simpleLogger("Filtered by preGlobalEventFilter@"+this.options.name, topic, event, model2, option);
         return; 
      }
      if(!this.preGlobalEventListener(event, model2, option)){
      	simpleLogger("Returned false from preGlobalEventListener@"+this.options.name, topic, event, model2, option);
      	return;
      }
      if(!this.globalEventFilter(event, model2, option, flg)){
         simpleLogger("Filtered by globalEventFilter@"+this.options.name, topic, event, model2, option);
         return;
      }
      this.globalEventAdapter(topic, event, model2, option);

      this.globalEventListener(topic, event, model2, option);
   }
		 
   $.tane.base.prototype.preGlobalEventFilter = function(topic, event, data, option, flg){  
	   var d = event.destination().split('/')[0];
	   var c = event.cc();
	   var o = event.originName();
	  
      if(o == this.options.name) return false;
      if(this.getAllEvents) return true;
      if(d!="*" && !this.options.name.match(d)){
         if(c!="*") return false;
         if(c=="") return false
         if(!this.options.name.match(c)) return false;
      }

      if(data && this.options.type!="general" && this.datalist.length>0){
         for(var i=0; i<this.datalist.length; i++){
            if(this.datalist[i].indexOf(':')==-1)
               var datalist_dataname = this.datalist[i];
            else
               var datalist_dataname = this.datalist[i].split(':')[1];
            datalist_dataname = (datalist_dataname.charAt(0)=='/') ? datalist_dataname.slice(1) : datalist_dataname;           
            if(data.trim(datalist_dataname)) break;
            if(i == this.datalist.length-1) return false;
         }
      }
      if(this.testEvent(FilterList, event)) return false;
   	return flg;
   }
   
   // System Event Listener
   $.tane.base.prototype.preGlobalEventListener = function(event, data, option){
      switch(event.eventName()){
      case "show":
         if(this.active==true) return false;
         if($('#'+this.locationID).hasClass('widgetManager')){
            var mylocation = $('#'+this.locationID).parent().attr('id');
         }else{
            var mylocation = this.locationID;
         }
//         this.pubGlobalEvent('public/do/*/hide?'+mylocation, data);
         this.getVisible(this.wid);
         return false;
      case "hide":
         if($('#'+this.locationID).hasClass('widgetManager')){
            var mylocation = $('#'+this.locationID).parent().attr('id');
         }else{
            var mylocation = this.locationID;
         }
         if(option!=mylocation && option!="*") return false;
         if(this.active==false) return false;
         this.getInvisible(this.wid);         
         return false;
	   case "init":
	      this._destroy();
	      var template = data.getData('template');
	      this.changeTemplate(template, this.locationID);
	      return false;
	   case "terminated":
//	      this._destloy();
	      return false;
         break;
      case "add":
      case "set":      
      case "update":          

         break;	
      }   
	   return true;
   }

   $.tane.base.prototype.globalEventFilter = function(event, data, option, flg){return flg;}
   
   // Adapter table example
   // Adapters : [
   //   { topic1: [{ conditions: [{cond1}, {cond2},...], callbacks: []},
   //              { conditions: [{cond1}, {cond2},...], callbacks: []},...]
   //   { topic2: [{ conditions: [{cond1}, {cond2},...], callbacks: []},
   //              { conditions: [{cond1}, {cond2},...], callbacks: []},...]
   $.tane.base.prototype.globalEventAdapter = function(topic, event, model, option){
      var data = model && clone(model.getData());
      this.Adapters[topic] && this.Adapters[topic].forEach(function(entry, index){
         if(this.testEvent(entry.conditions, event)){
            var adapter = entry.callback;
            var statement = "return new "+entry.callback+"(arg1, arg2, arg3);";
            var f = new Function('arg1', 'arg2', 'arg3', statement);
            model.clear();
            model.setData(f(event,data, option)||data);
         }
      }, this); //end of forEach
   }
   
   // Event Listner prototype definition
   // EventHandler table example
   // EventHandlers : [
   //   { topic1: [{ eventName: event, callback: function},
   //              { eventName: event, callback: function},...]
   //   { topic2: [{ eventName: event, callback: function},
   //              { eventName: event, callback: function},...]
   //    ....
   // '*' event applies to any event.   
   $.tane.base.prototype.globalEventListener = function(topic, event, model, option){
      if(!this.GUIReady){
         this.pendingEvents.push({event:event, model:model, option:option, topic:topic});
         return false;
      }
      
      this.globalEventHandlers[topic] && this.globalEventHandlers[topic].forEach(function(entry){
         if(entry.eventName == '*' || entry.eventName == event.eventName()){
            var callback = entry.callback.bind(this);
            callback(event, model, option);
         }            
      }, this);   
   }   
	   
// Handler registration
// Global Event Handler
   $.tane.base.prototype.addGlobalEventHandler = function(event, handler, topic){
      if(!topic) topic = this.globalSubTopic;
      if(!this.globalEventHandlers[topic]){
         this.globalEventHandlers[topic] = [];
      }   
      this.globalEventHandlers[topic].push({eventName: event, callback: handler});
   }
// Event Adapter
   $.tane.base.prototype.addEventAdapter = function(topic, condTbl, callback){
      if(!this.Adapters[topic]){
         this.Adapters[topic] = [];
      }
      this.Adapters[topic].push({conditions: condTbl, callback: callback});
      return; // Array
   }

// Local event listener prototype definition
   $.tane.base.prototype.localSystemEventListener = function(topic, event, data, option){
      if(!this.preLocalEventFilter(event, data, option)) return;
      this.preLocalEventListener(event, data, option);
      if(!this.localEventFilter(event, data, option)) return;
      this.localEventAdapter(event, data, option);
      this.localEventListener(event, data, option);
   }
   $.tane.base.prototype.preLocalEventFilter = function(event, data, option){
      if(event.originName()==this.options.name) return false;
      return true;   
   }
   
   $.tane.base.prototype.preLocalEventListener = function(event, model, option){
      switch(event.eventName()){
      case "validate":
         if(this.model.validate()){
         this.pubLocalEvent('local/do/*/close');
            return true;
         }else return false;
         break;
      case "show":
         if(this.active==true) return false;
         if($('#'+this.locationID).hasClass('widgetManager')){
            var mylocation = $('#'+this.locationID).parent().attr('id');
         }else{
            var mylocation = this.locationID;
         }
         this.pubGlobalEvent('public/do/*/hide', model, mylocation);
         this.getVisible(this.wid);
         return false;
      }
      return true;  
   }
   $.tane.base.prototype.localEventFilter = function(event, data, option){return true}
   $.tane.base.prototype.localEventAdapter = function(event, data, option){}
   $.tane.base.prototype.localEventListener = function(event, model, option){}
   $.tane.base.prototype.addExtraEventListener = function(f, array){
      array.push(f);
   }

   
   // Track events
   $.tane.base.prototype.eventMonitor = function(event, data, topic, option){
      this.monitorEvent = clone(event);
      this.monitorData = clone(data);
      this.monitorOption = option;
   }
   
   // Event converter for custom
   $.tane.base.prototype.eventConverter = function(event, data, topic, option){}
   
      
// Prototype functions for base
// Generates sub UI Components
   $.tane.base.prototype.genGUIObjects = function(defArray, element, classid){
      var scope = element || $('#'+this.wid); 
      var targetClass = classid || '.tane-widget-top';
      var main_d = $.Deferred();
      var dlist = [];
      var dcnt = 0;      
      for(var c=0; c<defArray.length; c++){
         var elemtype = defArray[c].elementType;
         var compname = defArray[c].compName;
         var jsfile = defArray[c].jsFile;
         var deps = defArray[c].deps;
         var objectlist = [];
//         var guicomps = this.GUIComps.get(compname) || {compname: compname, objectlist: objectlist};
         var findDepth = scope.parents(targetClass).length+1;    
         var elemarray = scope.find(elemtype);
         for(var i=0; i<elemarray.length; i++){
            var depth = $(elemarray[i]).parents(targetClass).length;
            if(depth == findDepth){
               var shimdef={};
               shimdef[elemtype] = {deps:[deps], exports: compname};
//               shimdef[elemtype]={deps:['tane.base', 'tane.ui.base', defArray.deps], exports: compname };             
               var pathdef={};
               pathdef[elemtype]=jsfile;
               require.config({shim: shimdef, paths: pathdef, waitSeconds: 0});
               
               var dataname = $(elemarray[i]).attr("x-data-dataname") ||
               					$(elemarray[i]).parents('.uispec').attr("x-data-dataname") ||
               					$(elemarray[i]).attr("x-data-framename") ||
               					$(elemarray[i]).parents('.uispec').attr("x-data-framename") ||
               					this.dataname || "default";
               
               if(this.modelStack.length()==0){
                  var model = new TaneModel();
                  model.dataName(dataname);
                  this.modelStack.set(dataname, model);
               }else var model = this.modelStack.get(dataname);

               var statement = "return new "+compname+"(arg1, arg2, arg3, arg4);";
               var f = new Function('arg1', 'arg2', 'arg3', 'arg4', statement);
               if(!require([compname]).specified(compname)){
                  define(compname, [elemtype], function (comp){ 
                     return comp; 
                  });
               }
               dlist[dcnt] = $.Deferred();
               dcnt++;
               var parms = {
                  name: compname,
                  args: [$(elemarray[i]), this.localTopic, this.options, model],
                  deffered: dlist[dcnt-1],
                  loaded: objectlist
               }
               require([compname], function(comp){
                  var f = new comp(this.args[0], this.args[1], this.args[2], this.args[3]);
                  this.loaded.push(f);
                  this.deffered.resolve();
               }.bind(parms));
               dlist[dcnt-1].promise().done(function(){
                  dcnt--;
                  if(dcnt==0) main_d.resolve();
               }.bind(this));
               
// Following is the sample code for loading scripts by adding tag.
//             if($.fn.foo == undefined) {
//               var script = document.createElement('script');
//               script.src = jsfile;
//               document.getElementsByTagName('head')[0].appendChild(script);
//               var statement = "return new "+compname+"(arg1, arg2, arg3, arg4);";
//               var f = new Function('arg1', 'arg2', 'arg3', 'arg4', statement);
//               f($(elemarray[i]), this.localTopic, this.options, this.model);               
//             }
            }
         }
//         this.GUIComps.set(compname, guicomps);
      }
      if(dcnt==0) return null;
      return  main_d.promise();
   }

// Discard sub UI Components
   $.tane.base.prototype.delGUIObjects = function(){
//      for(var i=0; i<this.GUIComps.length; i++){
//         var array = this.GUIComps[i].objectlist;
//         for(var k=0; k<array.length; k++){
//            array[k].destroy();
//         }
//      }
   }

// (Drag and) Drop common function
   $.tane.base.prototype.catchDroppedItem = function( event, ui, id ){
      if(event.type == 'drop'){
         if(ui.draggable.hasClass('draggable-x')){
            var type = ui.draggable.attr('x-draggable-type');
            var event2 = new TaneEvent(this.options.name);
            this.localEventListener(event2.eventName('drop').attr('type', type), ui.draggable, id);
         }else{
            var eid = ui.draggable.attr('id');
            if(eid == "color"){
               var bgcolor =  ui.draggable.css('background-color');
               var rgb = bgcolor.split('(')[1].split(')')[0];
               var rgba = 'rgba('+rgb+','+ui.draggable.css('opacity')+')';
               var name = $(event.target).attr('id');
               $('#'+name).css('background-color', rgba);
               var data = new TaneModel({"eid":name, "css":{"background-color":rgba}});
               this.pubGlobalEvent("public/event/ui/edit", data);
            }else{
               var position = ui.position;
               var offset = ui.offset;
               var data = new TaneModel({"eid":eid, "css":{"position":position, "offset":offset}});
               this.pubGlobalEvent("public/event/ui/edit", data);
            }
         }
      }
   }

// hide, show, Change Size, Close, Preference, etc
   $.tane.base.prototype.widgetSystemOperation = function(event){
      var $target = $( event.target );
      var wid = $target.closest(".tane-widget-top").attr('id');
      if(wid != this.wid) return;
      if ( $target.is( ".ui-icon-wrench" ) ) {
         new SimpleDialog(wid, wid, 'preference_form.template');
      } else if ( $target.is( ".ui-icon-minus" ) ) {
         this.getInvisible();
      } else if ( $target.is( ".ui-icon-close" ) ) {
         this.destroy(wid);
      } else if ( $target.is( ".ui-icon-plus" ) ) {
         ;
      }
 //        event.stopImmediatePropagation();
      return true;
   }

   $.tane.base.prototype.getInvisible = function(){
      $('#'+this.wid).hide('fade');
      var data = new TaneModel();
      var info = {"eid": this.locationID, "wid":this.wid, "icon":this.options.icon, "name":this.options.name};
      data.setData('name', info);
      data.dataName("widgetInfo");
      this.pubGlobalEvent("*/do/"+this.widgetManager+"/getInvisible", data, this.eid);
      this.active = false;
   }

   $.tane.base.prototype.getVisible = function(){
      $('#'+this.wid).show('fade');
      var data = new TaneModel();
      var info = {"eid": this.locationID, "wid":this.wid, "icon":this.options.icon, "name":this.options.name};
      data.setData('name', info);
      data.dataName("widgetInfo");      
      this.pubGlobalEvent("*/do/"+this.widgetManager+"/getVisible", data, this.eid);
      this.active = true;
   }

   $.tane.base.prototype.changeSize = function(event, ui){
      var data = new TaneModel({ "eid": ui.element.attr('id'), "css":{"size": ui.size}});
      this.pubGlobalEvent("public/event/ui/edit", data);
      ;
   }

   $.tane.base.prototype.listenTo = function(callback){
      this.observer.listenTo(callback, "all", this.eventListener);
   }
   
   // Test event to conditions table
   // Returns;
   //  true - if match on of the entry in the table
   //  false - if not match any of the entry in the table
   $.tane.base.prototype.testEvent = function(table, event){  
      var e = event.eventName();
	   var d = event.destination().split('/')[0];
   	var c = event.cc();
	   var o = event.originName();
	   var p = event.getStringParms();

   	for(var i=0; i<table.length; i++){
	      // origin
	      if(o && table[i].origin){
   	      if(table[i].origin.charAt(0)=="!"){
	            if(o.match(table[i].origin.replace("!", ""))) continue;
   	      }else{
               if(!o.match(table[i].origin)) continue;
            }
         }
         // event
	      if(e && table[i].event){         
      	   if(table[i].event.charAt(0)=="!"){
	            if(e.match(table[i].event.replace("!", ""))) continue;
	         }else{         
               if(!e.match(table[i].event)) continue;
            }
         }
         // parm
         if(p && table[i].parm){         
      	   if(table[i].parm.charAt(0)=="!"){
	            if(p.match(table[i].parm.replace("!", ""))) continue;
	         }else{         
	            if(!p.match(table[i].parm)) continue;
   		   }
	   	}
		   //destination
   	   if(d && table[i].destination){		   
			   if(table[i].destination=="\*" && d!="*") continue;
			   if(table[i].destination=="!\*" && d=="*") continue;  

	         if(table[i].destination.charAt(0)=="!"){
	            if(this.options.name.match(table[i].destination.replace("!", ""))) continue;
	         }else{
 		         if(!this.options.name.match(table[i].destination)) continue;
	         }
	   	}

	   	//return specified return value.
	   	if(table[i].value && table[i].value=="false") return false;
	   	else return true;
      }
      return false;
   }
   
   // Test this element whether my own object or child widget's object
   // Returns;
   //  true - my own object
   //  false - child widget's object
   $.tane.base.prototype.isMyOwnElement = function(element, wid){  
      var element_depth = $(element).parents('.tane-widget-top').length;
      if($("#"+wid).hasClass('tane-widget-top')) element_depth--;
      var widget_depth = $("#"+wid).parents('.tane-widget-top').length;
      if(element_depth==widget_depth) return true;
      else return false;
   }
})(jQuery);

//Common utilities

function startjQWidget(pluginname, options, eid, jsfile, deps){
   var start = function(){
      var section = Math.random().toString(36).slice(-8);
      var workspace = $("#"+eid);
      $("<section id='"+section+"' class='widgetManager' x-data-eid='"+eid+"'></section>").appendTo(workspace);

      var f = new Function('arg1', "return new $('#"+section+"')."+pluginname+"("+options+");");
      f(options);
//            var line = "<script>$('#"+section+"')."+plugin+"({name:'"+widgetname+"'"+plugin_options+"});</script>";
//            $(line).appendTo(workspace);
   }.bind(this);
         
   if(jsfile){
      var shimdef={};
      shimdef[pluginname]={
         deps: [deps],
         exports: pluginname
      };
      var pathdef={};
      pathdef[pluginname]=jsfile;
      require.config({shim: shimdef, paths: pathdef, waitSeconds: 0});

      var f = "if($.fn."+pluginname+" == undefined) return false; else return true;";
      var loaded = new Function(f);
      if(loaded()) start.call();
      else{
         require([pluginname], function(comp){
            start.call();
         }.bind(this));            
      }
   }else{
      start.call();
   }
}

function loadHtml(name){
   var html;
   $.ajax({
      url: name,
      method: 'GET',
      async: false,
      success: function(data) {
      html = data;
      }
   });
   return html;
}

// Data model functions

var TaneModel = $.extend(Backbone.Model, {
});

TaneModel.prototype.initialize = function(obj){
	this.setData(obj);
}

TaneModel.prototype.dataName = function(name){
   if(!name) return this.name;
   else this.name = name
   var array = name.split('/');
   this.pathlength = array.length;
   if(array.length > 1){
      this.keyname = array[array.length-1];
      for(var i=0; i<array.length-1; i++){
         if(i==0) this.base=array[0];
         else this.base = this.base+'/'+array[i];
      };
   }
   return this;
}

TaneModel.prototype.checkName = function(name){
   if(!name) return false;
   if(!this.name) return name;
//   if(!this.name.startWith(name)) return false;
   var path = matchRegExp(this.attributes, name.replace(this.name, ""));
   return path;
}

TaneModel.prototype.getData = function(key){
   // If key parm is omitted, the data assumed to be a object list. 
   if(!key) return this.attributes;
   var child = this.checkName(key);
   if(!child) var child = key;      
   var data = findKeyValue(this.attributes, child);
   return data;
//   var array = child.split('/');
//   if(this.pathlength<array.length)
//      return findKeyValue(this.attributes, key.replace(this.name, ""));
//   if(this.pathlength==array.length-1)
//      return this.attributes;
}

TaneModel.prototype.getDataAsArray = function(){
   var data = this.getData();
   var i = 0;      
   Object.keys(data).forEach(function(key){
      var obj = {};
      obj[key] = data[key];
      array.push(obj); 
      i++;
   }, this);
   return array;
}

TaneModel.prototype.setData = function(parm1, parm2){
   if(!parm2){
      this.set(parm1);
      return;
   }else{
      var child = this.checkName(parm1);
      if(!child) var child = parm1;       
      var data = parm2;

      var obj = this.attributes;
      var path = child.split('/');
      for(var i=0; i<path.length; i++){
         if(obj[path[i]]){
            if(i==path.length-1){
               obj[path[i]] = data;
               return;
            }else obj = obj[path[i]];
         }else{
            if(i!=path.length-1){
               obj[path[i]] = {};
               obj = obj[path[i]];
            }
         }
      }
      obj[path[i-1]] = data;
   }
}

TaneModel.prototype.get1stKey = function(){
   return Object.keys(this.attributes)[0];
}
TaneModel.prototype.get1stValue = function(){
   return this.attributes[this.get1stKey()];
}

TaneModel.prototype.isPlainObject = function(){
   var plain;
   Object.keys(this.attributes).forEach(function(key){
      if(!(this.attributes[key] instanceof Object)) plain = true;
   }, this);
   if(plain) return true;
   else return false;}

TaneModel.prototype.isObjectArray = function(){
   var array;
   var noarray;
   Object.keys(this.attributes).forEach(function(key){
      if(this.attributes[key] instanceof Object) array = true;
      else noarray = true;
   }, this);
   if(array && !noarray) return true;
   else return false;
}

TaneModel.prototype.getId = function(){
	var idattr = this.idAttribute;
	return this.get(idattr);
}

TaneModel.prototype.setId = function(val){
    var idattr = this.idAttribute;
	return this.set(idattr, val);
}

TaneModel.prototype.setIdAttr = function(attr){
	this.idAttribute = attr;
}

TaneModel.prototype.getIdAttr = function(){
	return this.idAttribute;
}

TaneModel.prototype.trim = function(path){
   if(this.name.indexOf(':')==-1) var name = this.name;
   else var name = this.name.split(':')[1];
   if(name.charAt(0)=='/') var start=1; else var start=0; 
   if(name.charAt(name.length-1)=='/') var end=-1; else var end=name.length;
   var dataname = name.slice(start, end);
   if(path.charAt(0)=='/') start=1; else start=0; 
   if(path.charAt(path.length-1)=='/') end=-1; else end=path.length;
   path = path.slice(start, end);
   
   var array1 = dataname.split('/');
   var array2 = path.split('/');
   if(array1.length > array2.length) return false;
   for(var i=0; i<array1.length; i++){
      if(array1[i].match(array2[i])) continue;
      else return false;
   }
   if(i==array2.length) return true;
   var child=array2[i];
   for(var i=i+1; i<array2.length; i++){
      child = child +'/'+ array2[i];
   }
   var data = this.getData(child);
   var key = matchRegExp(this.attributes, child);
   this.clear();
   this.set(data);   
   this.name = dataname +'/'+ key;
   return true;
}

