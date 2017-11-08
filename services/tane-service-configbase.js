(function($) {
// Firebase for tane.zero
   $.widget("tane.TaneConfigBase", $.tane.TaneServiceBase, {
      apidef: [{"configbase":{}}],
      serviceInfo: {
         servicename: "configbase", 
         endpointHost: 'http://10.0.0.1',        
		},
      apidef: {
         "config": {
            apiname: 'config',
            comment: 'Lambfox nconf data API',
            inboundEvent: "get",
            outboundEvent: "get>response",
            method: "GET",
            uri: '/config',
         }
      }
   });
})(jQuery);
