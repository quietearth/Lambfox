var SimpleBitmovinPlayer = TaneBaseView.extend({

   _initialize: function(id){
      this.conf = {};   
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
         if(!videoinfo) return;
         this.player.destroy();
         this.player = bitmovin.player(this.myid);
         var conf = {};         
         conf["source"] = videoinfo.source;
//         conf["progressive"] = [{url: "https://storage.googleapis.com/lambfox2/360PolarLightsIceland4%D0%9A.mp4",
//                                type: "video/mp4"}];
         conf["key"] = this.conf.apiKey;       
         this.player.setup(conf).then(
            function(value) { // Success          
               console.log("Successfully created bitmovin player instance");
            }, 
            function(reason) { // Error!
               console.log("Error while creating bitmovin player instance");
      	   }
         );     
//         this.player.unload().load(videoinfo.source);
         break;
      }        
   }
});