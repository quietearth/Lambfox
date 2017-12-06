var SimpleBitmovinPlayer = TaneBaseView.extend({

   _initialize: function(id){
      this.player = bitmovin.player(this.myid);
      this.initPending = true;
   },
   preLocalEventListener: function(event, model){
      var val = model.getData(this.keyname);
      switch(event.eventName()){
      case "set":
         this.conf = model.getData();
         this.initPending = false;
         break;
 		}  
   },
   localEventListener: function(event, model){
      var val = model.getData(this.keyname);
      switch(event.eventName()){
      case "play":
         var videoinfo = model.getData();
         if(!videoinfo || !videoinfo.source) return;
         //this.player.destroy();
         var conf = {};         
         conf["source"] = videoinfo.source;
         conf["style"] = videoinfo.source;
         conf["key"] = this.conf.apiKey; 
         this.player.setup(conf)
         .then(function() { // Success          
            console.log("Successfully created bitmovin player instance");
            this.player.play();
         }.bind(this));     
//         this.player.unload().load(videoinfo.source);
         break;
      }        
   }
});