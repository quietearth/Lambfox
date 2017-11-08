(function($) {
// Service Base
   $.widget("tane.TaneServiceBase", $.tane.base, {
      isAPI: true,
      
      init: function(){
         this.svc = new TaneXHRService(this.localTopic, this.options.name);
	      this.addGlobalEventHandler('*', this.taneServiceBaseGlobalEventHandler);         
         this.serviceInit();
      },

      setURI: function(apidef, event, data){},
      transAPIData: function(apidef, event, data){
		   if(apidef.method == 'GET' && data){
      	　　var parms='';
            Object.keys(data).forEach(function(key){
               if(parms=='') parms=key+"="+data[key];
               else parms+='&'+key+"="+data[key];
            }, this);
				return parms;
			}else if(apidef.method == 'POST'){
            return data.getData();
		   }
		},
      transReceivedData(apidef, event, data){
		   if(RegExp('json','i').test(apidef.accept)){
		      return data.getDataValue('response');
         }else{
			   return {'data': data.getDataValue('response')};
			}
	   },
      getEventContext: function(apidef){return "local/api/"+apidef.apiname+"/response"},
      setContext: function(apidef, event, data) {return data;},

      taneServiceBaseGlobalEventHandler: function(event, data){
         var apidef = this.apidef[event.eventName()];
         if($.isEmptyObject(apidef)){
            return;
         }
         this.setURI(apidef, event, data);
         var apidata = this.transAPIData(apidef, event, data);

         switch(apidef.method){
         case "POST":
         case "PUT":
         case "DELETE":
            this.svc.POST(apidef, apidata, this.serviceInfo, event.originName());
            break;
         case "GET":
            this.svc.GET(apidef, apidata, this.serviceInfo, event.originName());
            break;
         }
      },
      localEventListener: function(event, data, option){
         var apidef = this.apidef[event.destination()];
         if(event.eventName()=="response"){
   			var trns = this.transReceivedData(apidef, event, data);
				var taneModel = new TaneModel(trns);
		      var outevent = new TaneEvent(this.widgetName).eventName(apidef.outboundEvent).destination(option);
            this.pubGlobalEvent(outevent, taneModel, this.setContext(apidef, event));
         }
      },
      serviceInit: function(){}
   });

   $.widget("tane.TaneLocalStoreBase", $.tane.base, {
   });

   $.widget("tane.TaneUIPreference", $.tane.TaneLocalStoreBase, {
      store: '',
      init: function(){
         this.store = new TanePreference();
         for(var l=0; l<this.store.length; l++){
            var data = this.store.at(l).toJSON();
            var el = data["eid"];
            var props = data["css"];
            var keys = _.keys(props);
            for(var i=0; i<keys.length; i++){
               switch(keys[i]){
                  case 'size':
                     var width = props.size.width;
                     var height = props.size.height;
                     $('#'+el).width(width);
                     $('#'+el).height(height);
                     break;
                  case 'position':
                     var top = props.position.top;
                     var left = props.position.left;
                     $('#'+el).css({'top':top, 'left':left});
                     break;
                  case 'offset':
//                     var offset = props[keys[i]].offset;
//                     $('#'+el).offset(offset);
                     break;
                  case 'background-color':
                     var rgba = _.property("background-color")(props);
                     $('#'+el).css('background-color', rgba);
                     break;
               }// end of switch
            } // end of for
         } // end of for
      },
      globalEventListener: function(event, dataModel) {
         switch(event.eventName()) {
           case "edit":
              var data = dataModel.getData();
              if(this.store.GET('eid', data.eid) == undefined){
                 this.store.POST(data);
              }else{
                 this.store.PUT('eid', data);
              }
              break;
           case "reset":
              this.store.RESET();
              break;
         } // switch
      }
   });	

// local store
   $.widget('tane.todostore', $.tane.TaneLocalStoreBase, {
      store: '',
      init: function(){
         this.store = new TodoStorageService();
         for(var i=0; i<this.store.length; i++){
            var data = this.store.at(i).toJSON();
            this.pubGlobalEvent('public/event/data/sync', data);
         }
      },

      globalEventListener: function(event, data) {
         switch(event) {
         case "public/do/data/create":
            var created = this.store.POST(data).toJSON();
            break;
         case "public/do/data/change":
            var update = this.store.PUT('eid',data);
            break;
         case "public/do/data/delete":
            this.store.DELETE(data);
            break;
         case "public/do/data/reset":
            var model = this.store.RESET();
            break;
         } // switch
      }
   });

})(jQuery);

///////////////////////////////////////////
// Basic Backbone Model components
///////////////////////////////////////////

var TaneXHRService = Backbone.Collection.extend({

   wid: '',
   localTopic: '',

   initialize: function(topic, name){
      this.localTopic = topic;
      bindHub(topic, this.localEventListener, this, name);
   },

   localEventListener: function(){},

   pubLocalEvent: function(event, data, option){
	  if(event instanceof TaneEvent){
         pubEvent(clone(event), clone(data), this.localTopic, option);
      }else{
 		   var array = event.split('/');
		   var outevent = new TaneEvent(this.widgetName);
		   outevent.destination(array[2]);
		   outevent.eventName(array[3]);
		}
      pubEvent(outevent, clone(data), this.localTopic, option);
   },


   GET: function(apidef, data, serviceInfo, origin) {
      try {	         
         var xhr = this.OPEN(apidef, data, serviceInfo);
         var taneData = new TaneModel();
         if(RegExp('text','i').test(apidef.accept)){
            xhr.onload = function(e){
               var response = xhr.responseText;
               taneData.setDataValue('response', response);
               this.pubLocalEvent("local/api/"+apidef.apiname+"/response", taneData);
            }.bind(this);
         }else if(RegExp('json','i').test(apidef.accept)){
            xhr.onload = function(e){
               var response = JSON.parse(xhr.responseText);
               taneData.setDataValue('response', response);
               this.pubLocalEvent("local/api/"+apidef.apiname+"/response", taneData);
            }.bind(this);
         }else{
            xhr.responseType = "arraybuffer";
            xhr.onload = function(e){
               var arrayBuffer = xhr.response; // Note: not oReq.responseText
               if (arrayBuffer) {
                  var byteArray = new Uint8Array(arrayBuffer);
                  taneData.setDataValue('response', byteArray);
                  this.pubLocalEvent("local/api/"+apidef.apiname+"/response", taneData);
                  ;
               }
            }.bind(this);
         }
         xhr.send();
      }catch(e){
         return e;
      }
   },

   POST: function(apidef, data, serviceInfo, origin) {
      if(data==undefined || data=="") return {};
      try {
			var xhr = this.OPEN(apidef, data, serviceInfo);
   	   if(apidef.contentType == 'application/json')
      	   json =JSON.stringify(data);
	      else
	      	json = data;
         var taneData = new TaneModel();
         if(apidef.responseType=="arraybuffer"){
            xhr.responseType = apidef.responseType;
            xhr.onload = function(e){
               var arrayBuffer = xhr.response; // Note: not oReq.responseText
               if (arrayBuffer) {
                  var byteArray = new Uint8Array(arrayBuffer);
                  taneData.setDataValue('response', byteArray);
                  this.pubLocalEvent("local/api/"+apidef.apiname+"/response", taneData, origin);
                  ;
               }
            }.bind(this);
         }else{
            xhr.onload = function(e){
               var resText = JSON.parse(xhr.responseText);
               taneData.setDataValue('response', resText);
               this.pubLocalEvent("local/api/"+apidef.apiname+"/response", taneData, origin);
            }.bind(this);
         }
         xhr.send(json);
      }catch(e){
         return e;
      }
   },
	
	OPEN(apidef, data, serviceInfo){
	   var url = serviceInfo.endpoint+apidef.uri;
	   var xhr = new XMLHttpRequest();

	   switch(serviceInfo.apiKeyType){
	   case 'uri':
    	   url+='?'+serviceInfo.apiKeyName+'='+serviceInfo.apiKey;
   	   xhr.open(apidef.method, url, true);   
    	   break;
		case 'json':
		   data[serviceInfo.apiKeyName] = serviceInfo.apiKey;
     	   xhr.open(apidef.method, url, true);		   
    	   break;
		case 'header':
     	   xhr.open(apidef.method, url, true);
		   xhr.setRequestHeader(serviceInfo.apiKeyName, serviceInfo.apiKey);
    	   break;
		case 'plaintext':
		   data += '&'+serviceInfo.apiKeyName+'='+serviceInfo.apiKey;
     	   xhr.open(apidef.method, url, true);		   
    	   break;
		default:
		   xhr.open(apidef.method, url, true);	
    	   break;
		}	   

   	if(apidef.method=="GET"){
   		if(data instanceof Object){
   		   // child object cannot be converted to GET URI format.
   		   // this type object will make a problem.
   			var parms = "";
   			Object.keys(data).forEach(function(key){
   				val = data[key];
   				parm = key +'='+ val;
   				parms += '&'+parm;
   			});
   		}else var parms = '&'+data;
//         if(url.search('?')) url=serviceInfo.endpoint+apidef.uri+parms;
//         else url=serviceInfo.endpoint+apidef.uri+'?'+data;
      }	

      if(apidef.accept){
         xhr.setRequestHeader('Accept', apidef.accept);
      }
		if(apidef.contenttype){
         xhr.setRequestHeader("Content-Type", apidef.contenttype);
      }
		return xhr;
	},
   responseListener: function(event, data){}
});

// Local storage

var TaneStorageProto = Backbone.Collection.extend({
//   localStorage: new Backbone.LocalStorage("demo"),
   model: TaneModel,

   initialize: function(){
      this.fetch();
      ;
   },
   localEventListener: function(event, data){
   },

   GET: function(key, value){
      var attr = {};
      attr[key]= value;
      var model = this.findWhere(attr);
      if(model){
         return model;
      }else{
         return undefined;
      }
   },

   POST: function(data){
//      var model = new TaneModel();
//      model.xhrdata);
//      model.unset('id');
//      var created = this.create(model);
      var model = new TaneModel();
      model.set(data);
      model.unset('id');
      return this.create(model.toJSON());
//      return this.findWhere(model.toJSON()).toJSON();
   },
   PUT: function(key, data){
      var model = this.GET(key, data[key]);
      if(model != undefined){
         var attr = _.clone(model.attributes);
         extendObj(attr, data);
         model.set(attr);
         model.save();
      }
      return model;
   },
   DELETE: function(data){
      var target = this.findWhere(data);
      if(target){
         target.destroy();
         return target;
      }else{
         return undefined;
      }
   },
   RESET: function(){
      this.reset();
   },
});

var TanePreference = TaneStorageProto.extend({
   localStorage: new Backbone.LocalStorage("pref"),
});
