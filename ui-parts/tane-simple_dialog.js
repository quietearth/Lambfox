//////////////////////
// Dialog
//////////////////////
var SimpleDialog = TaneBaseView.extend({

   _initialize: function(id, topicname, options, model){
      var open = this.$el.attr('x-autoOpen');
      if(open=="true") var autoopen = true;
      else var autoopen = false;
      var dialog = this.$el.find('.simple_dialog_content');
      var msgs = new TaneTable();
      var l = dialog.length;
      for(i=0; i<l; i++){
         var dlgcnt = dialog[i];
         var id = $(dlgcnt).attr('x-data-message') || '*';
      	
	      var dlg = $(dlgcnt).dialog({
   	      title: this.options.title,
      	   autoOpen: autoopen,
//       	height: options.height,
//       	width: options.width,
         	modal: true,             
      	});
			msgs.push(id, dlg);
			this.dialogTable = msgs;
		}      	
   },
   localEventListener(event, data){
      var op = event.eventName();
      switch(op){
      case "open":
      	var id = event.getParm('id');
      	var dialog = this.dialogTable.get(id);
         dialog.dialog("open");
         this.dialog = dialog;
         break;
      case "show":
         var open = this.$el.attr('x-autoOpen');
         if(open=="true") 
         this.dialog.dialog("open");
         break;
      case "close":
         this.dialog.dialog("close");
         break;
      }
   }
})