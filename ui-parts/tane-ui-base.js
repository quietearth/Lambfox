///////////////////////////////////////////
// Tane view component implementations
///////////////////////////////////////////
///////////////////////////////////////////
// Base class
///////////////////////////////////////////
var TaneBaseView = Backbone.View.extend({
//   el: $("#taneapp"),
   topic: '',
   template: '',
   handle: '',

   destroy: function(){
      unbindHub(this.handle);
      this._destroy();
   },
   _destroy: function(){},
   localEventListener: function(){},

   pubLocalEvent: function(event, data, option){
      if(event instanceof TaneEvent){
         pubEvent(clone(event), clone(data), this.topic, option);
      }else{
 	   	var array = event.split('?')[0].split('/');
 	   	var i = event.indexOf('?');
 	   	if(i>0) var parm = event.slice(i+1);
 	   	else var parm ="";
		   this.event.destination(array[2]).eventName(array[3]).attr('parm', parm);
         pubEvent(clone(this.event), clone(data), this.topic, option);
	   }
   },
   changeColor: function( event, ui ){
   //     this.$el.css('background-color', ui.draggable.css('color'));
      $('#test_button2').css('background', ui.draggable.css('background-color'));
   }
});

TaneBaseView.prototype.initialize = function(id, topicname, options, model){
   if(whatIsThis(id)=='Object') this.setElement(id);
   else this.setElement($("#"+id));

   this.myid = this.$el.attr('id');
   if(!this.myid){
      this.myid = this.el.localName+'_'+Math.floor(Math.random()*100000).toString();
      this.$el.attr('id', this.myid);
   }
   
   this.topic = topicname;
   this.event = new TaneEvent(this.myid);
   this.options = options;
   this.workingData = model;
   this.cstmDataTmplList = [];
   
//   this.dataname = $("#"+this.myid).closest(".tane-widget-top").attr("x-data-modelname"); 
   this.dataname = model.dataName() || 
 						 $("#"+this.myid).attr("x-data-dataname") ||
 					    $("#"+this.myid).closest(".uispec").attr("x-data-dataname");
   this.datatype = $("#"+this.myid).closest(".uispec").attr("x-data-datatype");
   this.dataframes = [];
   var dataframe = $("#"+this.myid).attr("x-data-dataframe") ||
                   $("#"+this.myid).closest(".uispec").attr("x-data-dataframe");
                      
   if(dataframe){
      var framearray = dataframe.split(',');
      for(i=0; i<framearray.length; i++){
           this.dataframes[i] = framearray[i];         
//         if(framearray[i].match("^@.*"))
//            this.dataframes[i] = framearray[i].substring(1);
//         else if(framearray[i].match("^/.*"))
//            this.dataframes[i] = this.dataname + framearray[i];
//         else
//            this.dataframes[i] = this.dataname +'/'+ framearray[i];
      }
   }
   
   this.keyname = this.$el.attr('x-data-keyname');
   this.type = this.$el.attr('x-data-type');   

   if(this.$el.attr('x-data-idAttribute')=='true') this.idattribute = true;
//   if(this.idattribute && this.keyname) this.model.setIdAttr(this.keyname);
   this.xevent = this.$el.attr('x-data-xevent');
   this.xeventOption = this.$el.attr('x-data-xeventOption');   
   this.localevent = this.$el.attr('x-data-localevent');
   this.createData = this.$el.attr('x-data-createdata');
   
   var tmplobj = this.$el.find('.jqtmpl');
   this.itemTmpl = $(tmplobj).html();
   this.tmplType = $(tmplobj).attr('x-data-tmplType');
   if(this.$el.find('.tostring').length!=0) this.tostring = true;
   this.displayData = $(tmplobj).attr('x-data-display');
   
   var tmplobj = this.$el.find('.xeventTmpl');
   this.xeventTmpl = $(tmplobj).html();
   
   tmplobj = this.$el.find('.xeventOptionTmpl');
   if(tmplobj.length!=0) this.xeventOptionTmpl = $(tmplobj).html();

   var array = this.$el.find('.cstmDataTmpl');
   if(array){
      for(var i=0; i<array.length; i++){
         var key = $(array[i]).attr('x-data-keyname');
         var templ = $(array[i]).html();
   	   this.cstmDataTmplList[i] = {name: key, template: templ};
//         if(this.idattribute) this.model.setIdAttr(key);
      }
   }
   this.balloon = this.$el.find('.balloon').length ? true : false;
 
//   this.model.on("add:"+this.keyname, this.add, this);
//   this.model.on("change:"+this.keyname, this.change, this);
//   this.model.on("update:"+this.keyname, this.update, this);
//   this.model.on("remove:"+this.keyname, this.remove, this);
//   this.model.on("reset:"+this.keyname, this.reset, this);
   
   this.handle = bindHub(this.topic, this.localSystemEventListener, this, "uielement");
//   _.bindAll(this, 'dataMonitor');

   this.pendingEvents = new Array();
   this.initPending = false;
   this._initialize(id, topicname, options, model);
   return this.keyname;
}

TaneBaseView.prototype._initialize = function(id, topicname, template){}

// Local event listener prototype definition
TaneBaseView.prototype.localSystemEventListener = function(topic, event, data, option){
   if(!this.preLocalEventFilter(event, data, option)) return;
   this.preLocalEventListener(event, data, option);
   
   if(this.initPending){
      this.pendingEvents.push({event:event, model:data, option:option, topic:topic});
      return;
   }
     
   if(!this.localEventFilter(event, data, option)) return;
   this.localEventAdapter(event, data, option);
   this.localEventListener(event, data, option);
   while(this.pendingEvents.length>0){
      var e = this.pendingEvents.shift();
      this.localEventListener(e.event, e.model, e.option);
   }    
}
TaneBaseView.prototype.preLocalEventFilter = function(event, data, option){
   if(event.originName()==this.myid) return false;
   var d = event.destination();
   if(d!="*" && d!="na" && d!=this.name && d!=this.myid) return false;
   if(data && data.hasOwnProperty("cid")){
     var dataname = data.dataName();
     if(this.dataframes[0]){
       if(dataname)
         var dnl = dataname.endsWith('/') ? dataname.split('/').length-1 : dataname.split('/').length;
       for(var i=0; i<this.dataframes.length; i++){
         if(this.dataframes[i].split('/').length < dnl) continue;
         if(dataname.match(this.dataframes[i])){
           this.fbDataName = dataname.match(this.dataframes[i])[0];
           this.fbData = data;
           return true;
         }
       }
       return false;     
     } else if(this.dataname.match(dataname) || this.dataname == "default"){
       this.fbDataName = dataname;
       this.fbData = data;       
       return true;
     }
   }
   return false;
}
TaneBaseView.prototype.preLocalEventListener = function(event, model, option){
   switch(event.eventName()){
   case "indexArraySelect":
   case "set":
   case "update":
   case "add":
   case "addArray":      
      if(this.datatype != "eventTemplate")
         this.workingData = model;

	   break;
   }
}
TaneBaseView.prototype.localEventFilter = function(){return true}
TaneBaseView.prototype.localEventAdapter = function(){}

TaneBaseView.prototype.change = function(model, changedData){
   var data = model.getData();
   if(this.cstmDataTmplList){
      for(var i=0; i<this.cstmDataTmplList.length; i++){
         var val = $.tmpl(this.cstmDataTmplList[i].template, data).text();
		   var xkeyname = this.cstmDataTmplList[i].name;
         model.setData(xkeyname, val);
	  	   if(this.cstmDataTmplList[i].idAttr == 'true') model.setIdAttr(xkeyname);
	   }
   } 
}

TaneBaseView.prototype.add = function(){
   var hoge = false;
}
TaneBaseView.prototype.change = function(){
   var hoge = false;
}
TaneBaseView.prototype.update = function(){
   var hoge = false;
}
TaneBaseView.prototype.remove = function(){
   var hoge = false;
}
TaneBaseView.prototype.reset = function(){
   var hoge = false;
}


