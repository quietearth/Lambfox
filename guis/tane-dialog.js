/////////////////////////
// Simple Tab Based Menu
/////////////////////////

   $.widget("tane.TaneDialog", $.tane.SimpleUI, {
   // Initialize
      init: function(){
         this.addGlobalEventHandler('*', this.taneDialogGlobalEventHandler);      
//         var array = $('#'+this.wid).find('.simple_dialog');
//         for(var i=0, c=0; i<array.length; i++, c++){
//            this.genGUIObjects(this.options.objectlist, $(array[i]), '.dialog_content');          
//         }
      },  
      preGlobalEventListener: function(event, data, option){
         switch(event.eventName()){
         case "show":
            this.pubLocalEvent("local/do/*/show");
            return false;
         }
         return true;
      },     
      taneDialogGlobalEventHandler: function(event, data, option){
         switch(event.eventName()){
         case "success":
            this.pubLocalEvent("local/do/success/open");
            return false;
         case "error":
            this.pubLocalEvent("local/do/fail/open");
            return false;            
         }
         return true;
      },          
      localEventListener: function(event, model){
         var op = event.eventName();
	      switch(op){
	      case 'open':
            this.pubLocalEvent("local/do/*/open");
            break;
   	   case 'close':
            this.pubLocalEvent("local/do/*/close");
            break;
   	   case 'submit':
            this.pubLocalEvent("local/do/*/close");
            this.pubGlobalEvent("public/do/widgetManager/showReward", model,this.eid);
            break;            
	      }
      }  
   });
