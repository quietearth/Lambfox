// UI Component Library

(function($) {
   // General UI Widget
   $.widget("tane.SimpleUI", $.tane.base, {
      init: function(){
         this.addGlobalEventHandler('*', this.simpleUIGlobalEventHandler);
      },
      simpleUIGlobalEventHandler: function(event, model, option){
         var op = event.eventName();
         var localevent = new TaneEvent(this.options.name);
         localevent.eventType('local');
         localevent.destination('*');
         localevent.eventName(op);
         localevent.setParm(event.getParm());
			this.model = model;
         this.pubLocalEvent(localevent, model, option);
		   return true;
      },
      localEventListener: function(event, model, option){
//         if(option) option = option +'?'+ event.attr('parm');
         var op = event.eventName();
         switch(op){
         case "submit":
            var xevent = event.attr('parm');
            if(xevent){
               var event2 = xevent.split('?')[0];
//               var cmd = getLast(event2, '/');
//               if(cmd=="create" || cmd=="set" || cmd=="delete"){
               var name = model.dataName();
               if(name)
                  model.dataName(splitPath(name).path);
               this.pubGlobalEvent(xevent, model, option);
            }
            break;    
         case "selectableSelect":
		      if(option) this.pubGlobalEvent(option, model);
            else{
               var event2 = "public/event/na/select?dataname="+event.getParm("name");
               this.pubGlobalEvent(event2, model);
            }
            break;
         case "indexArraySelect":
            var event2 = "public/event/na/select?dataname=" + event.getParm('dataname');         
            var data = new TaneModel(model.getData());
            data.dataName(model.dataName());
            this.pubGlobalEvent(event2, data);
            if(option) this.pubGlobalEvent(option, data);
            break;
         case "selectMenuSelect":
            var optgroup = model.split('=')[0];
            var selected = model.split('=')[1];
            var array = $('#'+this.wid).find("[optgroup='"+optgroup+"']");
            _.map(array, function(elem){
               var extra=$(elem).attr("x-data-opt");
               if(extra === selected) $(elem).show();
               else $(elem).hide();
            });
            break;
         }
         return true;            
      },      
      suppress_globalEventFilter: function(event, data, option){
         var keysInput = Object.keys(data.getData());
         var keysModel = Object.keys(this.model.getData());
         if(keysInput.length==0||keysModel==0) return true;
         for(var i=0; i<keysModel.length; i++){
            if(keysInput.indexOf(keysModel[i])==-1){
               return false;
            }
         }
         return true;
      }
	});
})(jQuery);


