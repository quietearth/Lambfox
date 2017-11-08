(function($) {
   "use strict";
// controller
   $.widget('tane.TaneController', $.tane.base, {
      options: { 
      	eventAdapter: true,
	      standardEventMap: [
   	   {in:{origin:"lambfoxbase", event:"get>response"},   out:[{event:"set"}]},
   	   ]
      },
      eventMap: [],
      eventMap4InterApp: [],
      // Accept List:
      // describe events that this controller accept and passes to InterApp topic.
      // if destination specified the event is blocked.
      acceptList: [
       {origin: "AppBuilder", event: 'start'},      
      ],
      // Adapter List
      // Adapters applied when
      //  - all of the AdapterList condition match
      //    topic: topic name
      //    origin: originator name
      //    event: event name
      //    parm: parameter specified
      //    destination: widget name 
      //  - destination not any of the following
      //    - wildcard '*'
      //    - widget name to apply this condition(not destination in the event)
      //  - "!" means "if not".   
      // Adapter table example
      // AdapterList : [{conditions: [{cond1}, {cond2},...], callbacks: []},
      //                {conditions: [{cond1}, {cond2},...], callbacks: []},...]
      AdapterList: [
        {conditions: [{origin: "Chat", event: "dialog"}],
         callback: 'Chat2dialog'}
      ],
      widgetList: '',
      frontPubTopic: '',
      frontSubTopic: '',
      svcPubTopic: '',
      svcSubTopic: 'globalSvcPub',
      interAppTopic: 'InterAppNetwork',
      
      _init: function(){
         this.locationID = this.element.attr("id");
         this.AppName = this.options.appname || $("#"+this.locationID).closest(".tane-app").attr("id");
         this.widgetManager = "widgetManager";         
         this.frontSubTopic = this.AppName+"_public_1";      
         this.svcPubTopic = this.AppName+"_public_2";
         this.svcSubTopic = this.AppName+"_public_3";      
         this.frontPubTopic = this.AppName+"_public_4";     
         this.eventMap = this.options.standardEventMap;         
//         this.localTopic = this.options.name+"_local";
         this.widgetList = new TaneTable();
         this.globalEventHandlers = new Array();
         this.Adapters = {};
         this.GUIReady = true;

         this.addGlobalEventHandler('*', this.globalEventController, this.frontSubTopic); 
         this.addGlobalEventHandler('*', this.globalEventController, this.svcSubTopic);    
                  
         this.AdapterList.forEach(function(entry){
            this.addEventAdapter(this.frontSubTopic, entry.conditions, entry.callback);
         }, this);
       
         this.fronthub = bindHub(this.frontSubTopic, this.globalSystemEventListener, this, this.options.name );
         this.svchub = bindHub(this.svcSubTopic, this.globalSystemEventListener, this, this.options.name );
         this.intapphub = bindHub(this.interAppTopic, this.interAppEventListener, this, this.options.name );         
         
         var event = new TaneEvent(this.options.name);
         event.eventType('public').destination('firebase').eventName('get').attr('parm', 'eventMap');
         this.publishEvent('public/do/lambfoxbase/get?pathname=apps/'+this.options.appname+'/eventMap', new TaneModel(), this.svcPubTopic);
         ;         
      },
      preGlobalEventFilter: function(topic, event, data, option, flg){  
         if(event.getHopcount()==1) return false;
         if(event.originName() == this.options.name) return false;
         if(event.destination() == this.options.name && event.getParm('pathname') == 'apps/'+this.options.appname+'/eventMap'){
            var customMap = data.getData();
            Object.keys(customMap).forEach(function(key){
            	this.eventMap.push(customMap[key]);
            }.bind(this));
            return false;
			}
      	return flg;
      },   
      
      // Override the globalEventListener.
      // Convert event based on eventMap.
	   // Specific destination relayed to the target.         	   
	   // Wildcard destination delivered to the frontend only.
      globalEventController: function(event, data, option) {
         var eventArray = this.mapEvent(event, this.eventMap, option);
		   if(eventArray){
		      eventArray.forEach(function(mappedInfo){
 	            var target = mappedInfo.event.destination();
		         var cc = mappedInfo.event.cc();		         		         
		         var eventtype = mappedInfo.event.eventType();
   		      if(target!="*" && isSubscribed(this.svcPubTopic, target))
   		         // To the service
	               this.publishEvent(mappedInfo.event.setHopcount(), data, this.svcPubTopic, mappedInfo.option);
	            else if(target=="*" || isSubscribed(this.frontPubTopic, target))
	               // To the UI
		            this.publishEvent(mappedInfo.event.setHopcount(), data, this.frontPubTopic, mappedInfo.option);
		         else{
		            // If the widget has not been started
		            var event2 = new TaneEvent(this.options.name);
		            event2.eventType("public").destination(this.widgetManager).eventName("startWithEvent").setHopcount();
		            event2.attr("event", mappedInfo.event);
		            this.publishEvent(event2, data, this.frontPubTopic, option);
		         }
//               if(eventtype == "external")
//                  this.publishEvent(mappedInfo.event, data, this.interAppTopic, mappedInfo.option);
			   }, this); // end of forEach
		   } //endif
      },
      
      mapEvent: function(event, eventMap, option){
         var array = [];
		   for(var i=0; i<eventMap.length; i++){
			   if((!eventMap[i].in.origin      || event.originName().match(eventMap[i].in.origin)) && 
			      (!eventMap[i].in.destination || event.destination().match(eventMap[i].in.destination)) &&			   
			      (!eventMap[i].in.event       || event.eventName().match(eventMap[i].in.event))){
//			      (!eventMap[i].in.parm        || event.getStringParms().match(eventMap[i].in.parm))){ 
// 'parm' is excluded from the input condition.
			      for(var c=0; c<eventMap[i].out.length; c++){
   			      array[c] = new Object();
   			      array[c]["event"] = new TaneEvent();
                  
                  //event
			         var outevent = eventMap[i].out[c].event;
			         if(outevent) array[c].event.eventName(outevent);
			         else array[c].event.eventName(event.eventName());
			         //origin
		            var origin = eventMap[i].out[c].origin;
		            if(origin) array[c].event.originName(origin);
		            else array[c].event.originName(event.originName());			         
			         //destination
		            var target = eventMap[i].out[c].destination;
		            if(target) array[c].event.destination(target);
		            else array[c].event.destination(event.destination());
		            //cc
		            var cc = eventMap[i].out[c].cc;
		            if(cc) array[c].event.cc(cc);
		            else array[c].event.cc(event.cc());
		            //eventtype
		            var topic = eventMap[i].out[c].topictype;
		            if(topic) array[c].event.eventType(topic);
		            else array[c].event.eventType(event.eventType());
		            //parm
		            var parm = eventMap[i].out[c].parm;
		            if(parm) array[c].event.setStringParms(eventMap[i].out[c].parm);
		            else array[c].event.attr('parm', event.attr('parm'));
		            //option
		            var option2 = eventMap[i].out[c].option;
		            if(option2) array[c].option = option2;
		            else array[c].option = option;
			      } // end of for
				   return array;
		      } //endif
		   } // end of for
		   array[0] = {event: event, option: option};
		   return array;
      },
      
      // Apply the custom adapter
      preGlobalEventListener: function(event, data, option){
      
       return true; 
       
      },
  
      interAppEventListener: function(topic, event, data, option) {
         if(event.originName() == this.options.name) return;
         if(event.appName() != this.AppName) return;
         if(!this.testEvent(this.acceptList, event)) return;
         var eventArray = this.mapEvent(event, this.eventMap4InterApp);
		   if(eventArray)
		      eventArray.forEach(function(event2){
		         this.publishEvent(event2, data, this.frontPubTopic, option);
		      }, this);
		   else
		      this.publishEvent(event, data, this.frontPubTopic, option);
      },   
   
      firebaseDataTransformer: function(event, data, option){
         var array = [];
         var obj = data.getData();
         var objkeys = Object.keys(obj);
         for(var c=0; c<objkeys.length; c++){
            var item = {};
            var key = objkeys[c];
            var val = obj[key];
            item[key] = val;
            array[c] = item;
         }
         data.clear();
         data.setDataValue(event.attr('parm'), array);
         return data;
      },
   })
})(jQuery);

function Chat2dialog(event, data, option){
   var data2={};
   Object.keys(data).forEach(function(key){
      if(key=="utts") data2["utt"]=data[key];
      else if(key!="utt") data2[key]=data[key];
   }, this);
   return data2;
}