   // Standard Menu Management Widget
   // Manage menus with logical name
   //  -templates are described with logical menu name.
   //  -Menu management widget maps logical name to firebase datasnapshot reference name
   //  -Then access to it!
   
   $.widget("tane.TaneMenu", $.tane.SimpleUI, {
      init: function(){
         this.addGlobalEventHandler('*', this.simpleUIGlobalEventHandler);       
//         this.pubGlobalEvent("public/do/lambfoxbase/get?pathname=apps/"+this.AppName+"/menus/"+this.options.name);         
      },   
//      simpleMenuGlobalEventHandler: function(event, model, option){
//         var op = event.eventName();
//		   switch(op){
//         case 'set':
//            this.menuitems = model.getData();
//            this.model.set(this.menuitems);
//            this.model.dataName(model.dataName());            
//            this.pubLocalEvent('local/do/*/'+op, this.model);
//            break;
//		   }
//		   return true;
//      },
      localEventListener: function(event, model, option){
         switch(event.eventName()) {
         case "indexArraySelect":
            var data = new TaneModel(model.getData());
            this.pubGlobalEvent(data.getData('event'), data, data.getData('option'));
            break;
         case "submit":
            var xevent = event.attr('parm');
            if(xevent){
               var event2 = xevent.split('?')[0];
               var name = model.dataName();
               if(name)
                  model.dataName(splitPath(name).path);
               this.pubGlobalEvent(xevent, model, option);
            }
            break;                
         }
      },
   });