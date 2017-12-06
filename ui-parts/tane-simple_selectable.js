//////////////////////
//jQuery UI Selectable
//
// Data expected to be as follows;
// { {key(index):Object1}, 
//   {key(index):Object2},
//   {key(index):Object3}, ... 
// }
// Selected event is notified with only selected object without key(index).
//////////////////////
var SimpleSelectableList = TaneBaseView.extend({
   size: 0,
   current: '',
   _initialize: function(id){

      this.selectable =  this.myid;
      this.draggable = this.$el.hasClass('draggable') ? true : false;
	   this.type = this.$el.attr('x-data-selectableType');

      _.bindAll(this, 'render', 'click', 'selected', 'add', 'change');
      this.$el.selectable({ 
         selected: this.selected,
         filter: ".x-selectable-event"
       });
   },

   click: function(e) {
      var event = e;
   },
   selected: function(e, ui){
//     var selectable = "#"+$(this.el).attr("id")+" "+$(ui.selected).prop("tagName");
      this.current = ui.selected;
      var id = $(ui.selected).attr('id');
	   var data = {};
	   if(this.type=='static'){
	      var select = $(ui.selected).attr('x-data-value');
	      if(select) data[this.keyname] = $(ui.selected).attr('x-data-value');	      
	   }else{
         var data = getBindData('#'+id, 'DATA');
	   }
	   this.workingData.setData(data);
	   if(this.xevent){
         if(this.parentKey){
	         var parentdata = {}
   		   parentdata[this.parentKey] = this.parentNode;
	         var merged = _.extend(data, parentdata);
            var xevent = $.tmpl(this.xevent, merged).text();
         }else{
	         var xevent = $.tmpl(this.xevent, data).text();
	      }
      }else var xevent = null;
      var keyname = this.keyname || this.workingData.get1stKey();      
      this.pubLocalEvent("local/event/*/selectableSelect?name="+keyname, this.workingData, xevent );

	   if(this.localevent){
         this.pubLocalEvent("local/event/*/"+this.localevent, this.workingData);
	   }
      e.stopImmediatePropagation();
   },

   localEventListener(event, model, option){
      if(model instanceof TaneModel){
         if(this.keyname) var dataArray = model.getData(this.keyname);
         else var dataArray = model.getData();
      }
      if(!dataArray) return;
      switch(event.eventName()){
	   case "set":
	      this.clear();
		   Object.keys(dataArray).forEach(function(key){
            this.add(dataArray[key]);
		   }, this);
         break;
      case "add":
		   Object.keys(dataArray).forEach(function(key){
            this.add(dataArray[key]);
		   }, this);
         break;
      case "addArray":
         break;
      case "update":
		   Object.keys(dataArray).forEach(function(key){  
            this.add(dataArray[key]);
         }, this);
         break;
      case "remove":         
		   Object.keys(dataArray).forEach(function(key){     
            this.add(dataArray[key]);
		   }, this);
         break;
      case "clear":
		   this.clear();
         break;
	   }
	   this.pubLocalEvent("local/event/*/show");
   },

   add: function(data){
      if(this.tostring){
         var str = "";
         Object.keys(data).forEach(function(key){
            if(str) str += ", ";
            str += key + ":" + data[key];
         });
         var apply = { tostring: str };
      }else{
         var apply = data;
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
	   $(item).focus(0);
	   if(this.balloon)　$(item).balloon();
      this.size+=1;

      bindData('#'+id, 'DATA', data);
   },
   
   update: function(data, keyname){
	   var line = $.tmpl(this.itemTmpl, data);
      var id = this.getElementId(data, keyname);
      if(!id) return false;
      $(line).attr('id', id);
      $('#'+id).replaceWith($(line));
      bindData('#'+id, 'DATA', data)
   },
   
   remove: function(data, keyname){
      if(this.size == 0) return;
      if(!keyname || !data) return false;      
      var id = this.getElementId(data, keyname);
      if(!id) return false;
      $('#'+id).remove();
      removeData("#"+id, 'DATA');
      this.size-=1;
      if(id == $(this.current).attr('id')){
		   this.current=='';
	   }
   },

   clear: function(){
      var entries = $('#'+this.selectable).children();
      for(var i=0; i<entries.length; i++){
         $(entries[i]).remove();
         var element = '#'+$(entries[i]).attr('id');
         removeData(element, 'DATA');
      }
      this.size=0;
   },
   
   getElementId: function(data, keyname){
      var entries = $('#'+this.selectable).children();
		for(var i=0; i<entries.length; i++){
		   var id = $(entries[i]).attr('id');
         var bindData = getBindData('#'+id, 'DATA');
         if(bindData && bindData[keyname] == data[keyname]) return id
	   }
	   return $(this.current).attr('id');
   }
});
