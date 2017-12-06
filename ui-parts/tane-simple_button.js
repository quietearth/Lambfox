///////////
//Button
///////////
var SimpleButton = TaneBaseView.extend({

   _initialize: function(id){
      _.bindAll(this, 'click');
      this.$el.button().click(this.click);
   },
   localEventListener(event, data){
      switch(event.eventName()){
      case "update":
         this.update(data);
         break;
      }
   },
   click: function(e) {
      if(this.datatype == "eventTemplate")
         var model = this.fbData;
      else
         var model = this.workingData;
   	if(this.xeventOptionTmpl) this.xeventOption = $.tmpl(this.xeventOptionTmpl, model).text();

		var event ="local/event/*/submit"
      if(this.xeventTmpl) 
        var xevent = event +'?'+ $.tmpl(this.xeventTmpl, this.workingData.getData()).text();
      else if(this.xevent)
        var xevent = event +'?'+ this.xevent;
      else var xevent = event;
      
      var keyvalue = this.$el.attr('x-data-value');
      model.setData(this.keyname, keyvalue);
	   this.pubLocalEvent( xevent, model, this.xeventOption);
	   
   	if(this.localevent) this.pubLocalEvent( "local/event/*/"+this.localevent, model, this.xeventOption);

      e.stopImmediatePropagation();
  },
  update: function(model){
      var data = model.getData();
	   if(this.xeventOptionTmpl && !this.xeventOption) this.xeventOption = $.tmpl(this.xeventOptionTmpl, data).text();
      if(this.xeventTmpl){
         this.xevent = $.tmpl(this.xeventTmpl, data).text(); 
      }   
  }
})
