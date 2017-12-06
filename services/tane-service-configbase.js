(function($) {
// Firebase for tane.zero
   $.widget("tane.TaneConfigBase", $.tane.TaneServiceBase, {
      serviceInfo: {
         servicename: "configbase", 
         endpoint: 'http://192.168.1.11:8000',        
		},
      apidef: {
         "get": {
            apiname: 'get',
            comment: 'Lambfox nconf data API',
            inboundEvent: "get",
            outboundEvent: "get>response",
            method: "GET",
            accept: "json",
            uri: '/config',
         }
      },
      setURI: function(apidef, event, data){
         return apidef.uri+'?objectname='+event.getParm('pathname')
      }
   });
})(jQuery);
