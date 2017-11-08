(function($) {

   $.widget("tane.bitmovin_rest_api", $.tane.TaneServiceBase, {
      serviceInfo: {
         servicename: "Firebase Storage Service for lambfox", 
         endpoint: 'https://firebasestorage.googleapis.com/v0/b/lambfox2-ch1/o',
         apiKey: '',
		   apiKeyType: '', // header or uri or json or plaintext
		   apiKeyName: '',
//		   apiKeyName: 'X-Mashape-Authorization's
		},
      apidef: {
        testCORS: { apiname: 'bitmovin',
                    comment: 'bitmovin REST API',
                    inboundEvent: "get",
                    outboundEvent: "get>response",
                    method: "GET",
                    uri: '/demo%2F608586.mpd?alt=media&token=de48edf1-b879-4b53-bd1b-9387b80894f2',
                    accept: 'application/octet-stream' }
      },
      serviceInit: function(){
	      this.addGlobalEventHandler('*', this.configListner);
         this.pubGlobalEvent("public/do/firebase/get?pathname=apis/"+this.options.name);	      
      },
      configListner: function(event, data, option){
	      var op = event.eventName();
         switch(op){
      	case 'set':
      		var apidef = data.getData();
//      		this.serviceInfo = apidef.serviceInfo;
//      		this.apidef = apidef.serviceInfo.apidef;
      		break;
      	}
      },
      transAPIData: function(){}
   });
	
})(jQuery);
