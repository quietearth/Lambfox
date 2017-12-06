//////////////////
// Static element
//////////////////
var SimpleStaticElement = TaneBaseView.extend({
   _initialize: function(id){
      _.bindAll(this, 'stop');
   },
   stop: function(event, ui){
      var size = ui.size;
      var pos = ui.position;
   },
   localEventListener: function(event, model, option){
      switch(event.eventName()){
      case "update":
      case "set":
      case "add":
	      if(this.itemTmpl){
	         if(this.tmplType == "dataname") var data = {dataname: model.dataName()};
	         else var data = model.getData();
   	      var element = $.tmpl(this.itemTmpl, data);
	         $(element).appendTo('#'+this.myid);
//	         var hoge = $(line).text();
//            $(target).text(hoge);
	      }
         break;
      }
   },
   add: function(event, data, option){
   },
   change: function(event, data, option){
   },
   update: function(event, data, option){
   }
})
