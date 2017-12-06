//////////////////////
//jQuery UI Selectable
//
// Data expected to be as follows;
// { {key(index):Object1}, 
//   {key(index):Object2},
//   {key(index):Object3}, ... 
// }
// Selected event is notified with only selected object with key(index).
// { key(index): Object}
//
//////////////////////
var IndexedArrayList = SimpleSelectableList.extend({

   selected: function(e, ui){
//      var selectable = $(ui.selected).attr('x-data-selectable');
//      if(!selectable) return;
      this.current = ui.selected;
      var id = $(ui.selected).attr('id');
	   var data = getBindData('#'+id, 'DATA');
	   var model = new TaneModel();
      Object.keys(data).forEach(function(key){
         model.setData(data[key]);
         if(this.fbDataName) var basename = this.fbDataName;
         else var basename = this.dataname;
         if(this.dataname != "default"){
            if(this.keyname) var dataname = basename +'/'+ this.keyname +'/'+ key;
            else var dataname = basename +'/'+ key;
         }else var dataname = key;
         model.dataName(dataname);   
      }, this);
      
	   if(this.xevent){
         if(this.xeventTmpl){
            if(this.datatype == "eventTemplate") 
               var xevent = $.tmpl(this.xeventTmpl, model.getData()).text(); 
            else
               var xevent = $.tmpl(this.xeventTmpl, this.workingData.getData()).text();
         }else var xevent = this.xevent;
   	      
         if(xevent.startsWith('public/') || xevent.startsWith('local/'))
            event = 'local/event/*/submit?'+xevent;
         else{
            xevent.split(';').forEach(function(e){
               switch(e.split('=')[0]){
               case 'type':
                 var type = e.split('=')[1];
                 break;
               case 'destination':
                 var dest = e.split('=')[1];
                 break;
               case 'eventName':
                 var eventname = e.split('=')[1];
                 break;
               }
            });
            event = 'local/event/*/submit?'+type+'/do/'+dest+'/'+eventName;
         }
            
   	   if(this.xeventOptionTmpl)
   	      var option = $.tmpl(this.xeventOptionTmpl, model).text(); 
   	   else if(this.xeventOption)
   	      var option = this.xeventOption;
   	}else
   	   var event = 'local/event/*/indexArraySelect';
      
      this.pubLocalEvent(event, model, option);

	   if(this.localevent)
         this.pubLocalEvent("local/event/*/"+this.localevent, model);
	   
      e.stopImmediatePropagation();
   },


   localEventListener(event, model, option){
      if(model){
         if(this.keyname && !model.dataName().match(this.keyname+'$'))
            var dataArray = model.getData(this.keyname);
         else var dataArray = model.getData();
      }
      if(!dataArray || !(dataArray instanceof Array || dataArray instanceof Object)) return;
      switch(event.eventName()){
	   case "set":
	      this.clear();
		   Object.keys(dataArray).forEach(function(key){
            this.add(dataArray[key], key);
		   }, this);
         break;
      case "add":
      case "addArray":      
		   dataArray.forEach(function(key){
            this.add(dataArray[key], key);
		   }, this);
         break;
      case "update":
		   dataArray.forEach(function(key){  
            this.update(dataArray[key], key);
         }, this);
         break;
      case "remove":         
		   dataArray.forEach(function(key){     
            this.remove(dataArray[key], key);
		   }, this);
         break;
      case "clear":
		   this.clear();
         break;
	   }
   },

   add: function(data, keyname){
      if(this.displayData) var apply = findKeyValue(data, this.displayData);
      else var apply = data;
      if(this.tostring){
         var str = keyname + ": " + data.toString();
         var apply = { tostring: str };
      }
      var item = $.tmpl(this.itemTmpl, apply);
      var id = this.selectable+"_"+Math.floor(Math.random() * 100000).toString();
      $(item).attr('id', id);
      $(item).appendTo($('#'+this.selectable));
      if(this.draggable){
         $(item).draggable({
            helper: "clone",
         });
	   }
      this.size+=1;
      var obj = {};
      obj[keyname]=data;
      bindData('#'+id, 'DATA', obj);
   }
});
