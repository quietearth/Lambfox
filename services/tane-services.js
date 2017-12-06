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
		      return data.getData('response');
         }else{
			   return {'data': data.getData('response')};
			}
	   },
      getEventContext: function(apidef){return "local/api/"+apidef.apiname+"/response"},
      setContext: function(apidef, event, data) {return data;},

      taneServiceBaseGlobalEventHandler: function(event, model){
         var apidef = this.apidef[event.eventName()];
         if($.isEmptyObject(apidef)){
            return;
         }
         if(!model) var data = "";
         else var data = model.getData();
         var args = {
            serviceInfo: this.serviceInfo,                
            apidef: apidef, 
            data: this.transAPIData(apidef, event, data),
            uri: this.setURI(apidef, event, data),
            origin: event.originName()
         };
            
         switch(apidef.method){
         case "POST":
         case "PUT":
         case "DELETE":
            this.svc.POST(args);
            break;
         case "GET":
            this.svc.GET(args);
            break;
         }
      },
      localEventListener: function(event, data, option){
         var apidef = this.apidef[event.destination()];
         if(event.eventName()=="response"){
   			var trns = this.transReceivedData(apidef, event, data);
				var taneModel = new TaneModel(trns);
		      var outevent = new TaneEvent(this.options.name).eventName(apidef.outboundEvent).destination(option);
            this.pubGlobalEvent(outevent, taneModel, this.setContext(apidef, event));
         }
      },
      serviceInit: function(){}
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


   GET: function(args){
      try {	         
         var xhr = this.OPEN(args);
         var taneData = new TaneModel();
         if(RegExp('text','i').test(args.apidef.accept)){
            xhr.onload = function(e){
               var response = xhr.responseText;
               taneData.setData('response', response);
               this.pubLocalEvent("local/api/"+args.apidef.apiname+"/response", taneData, args.origin);
            }.bind(this);
         }else if(RegExp('json','i').test(args.apidef.accept)){
            xhr.onload = function(e){
               var response = JSON.parse(xhr.responseText);
               taneData.setData('response', response);
               this.pubLocalEvent("local/api/"+args.apidef.apiname+"/response", taneData, args.origin);
            }.bind(this);
         }else{
            xhr.responseType = "arraybuffer";
            xhr.onload = function(e){
               var arrayBuffer = xhr.response; // Note: not oReq.responseText
               if (arrayBuffer) {
                  var byteArray = new Uint8Array(arrayBuffer);
                  taneData.setData('response', byteArray);
                  this.pubLocalEvent("local/api/"+args.apidef.apiname+"/response", taneData, args.origin);
                  ;
               }
            }.bind(this);
         }
         xhr.send();
      }catch(e){
         return e;
      }
   },

   POST: function(args) {
      if(args.data==undefined || args.data=="") return {};
      try {
			var xhr = this.OPEN(args);
   	   if(args.apidef.contentType == 'application/json')
      	   json =JSON.stringify(args.data);
	      else
	      	json = args.data;
         var taneData = new TaneModel();
         if(args.apidef.responseType=="arraybuffer"){
            xhr.responseType = args.apidef.responseType;
            xhr.onload = function(e){
               var arrayBuffer = xhr.response; // Note: not oReq.responseText
               if (arrayBuffer) {
                  var byteArray = new Uint8Array(arrayBuffer);
                  taneData.setData('response', byteArray);
                  this.pubLocalEvent("local/api/"+args.apidef.apiname+"/response", taneData, args.origin);
                  ;
               }
            }.bind(this);
         }else{
            xhr.onload = function(e){
               var resText = JSON.parse(xhr.responseText);
               taneData.setData('response', resText);
               this.pubLocalEvent("local/api/"+args.apidef.apiname+"/response", taneData, args.origin);
            }.bind(this);
         }
         xhr.send(json);
      }catch(e){
         return e;
      }
   },
	
	OPEN(args){
	   var url = args.serviceInfo.endpoint+args.uri;
	   var xhr = new XMLHttpRequest();

	   switch(args.serviceInfo.apiKeyType){
	   case 'uri':
    	   url+='?'+args.serviceInfo.apiKeyName+'='+args.serviceInfo.apiKey;
   	   xhr.open(args.apidef.method, url, true);   
    	   break;
		case 'json':
		   data[args.serviceInfo.apiKeyName] = args.serviceInfo.apiKey;
     	   xhr.open(args.apidef.method, url, true);		   
    	   break;
		case 'header':
     	   xhr.open(args.apidef.method, url, true);
		   xhr.setRequestHeader(args.serviceInfo.apiKeyName, args.serviceInfo.apiKey);
    	   break;
		case 'plaintext':
		   data += '&'+args.serviceInfo.apiKeyName+'='+args.serviceInfo.apiKey;
     	   xhr.open(args.apidef.method, url, true);		   
    	   break;
		default:
		   xhr.open(args.apidef.method, url, true);	
    	   break;
		}	   

   	if(args.apidef.method=="GET" && args.data){
   		if(args.data instanceof Object){
   		   // child object cannot be converted to GET URI format.
   		   // this type object will make a problem.
   			var parms = "";
   			Object.keys(args.data).forEach(function(key){
   				val = data[key];
   				parm = key +'='+ val;
   				parms += '&'+parm;
   			});
   		}else var parms = '&'+args.data;
//         if(url.search('?')) url=serviceInfo.endpoint+apidef.uri+parms;
//         else url=serviceInfo.endpoint+apidef.uri+'?'+data;
      }	

      if(args.apidef.accept){
         xhr.setRequestHeader('Accept', args.apidef.accept);
      }
		if(args.apidef.contenttype){
         xhr.setRequestHeader("Content-Type", args.apidef.contenttype);
      }
		return xhr;
	},
   responseListener: function(event, data){}
});
