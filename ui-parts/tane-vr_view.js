var VRViewPlayer = TaneBaseView.extend({

   localEventListener: function(event, model){
      var val = model.getData(this.keyname);
      switch(event.eventName()){
      case "play":
         var videoinfo = model.getData();
         if(!videoinfo || !videoinfo.source) return;
         //this.player.destroy();
         var conf = {};         
         conf["video"] = videoinfo.source.dash;
         conf["width"] = videoinfo.style.width;
//         conf["height"] = videoinfo.style.height;
         if(!this.pllayer) this.player = new VRView.Player('#'+this.myid, conf);
         else this.player.setContentInfo(conf);
         this.player.play();
         console.log("Successfully created bitmovin player instance");

         break;
      case "set":
         var conf = {};         
         conf["video"] = videoinfo.source.dash;
         conf["width"] = videoinfo.style.width;
//         conf["height"] = videoinfo.style.height;

         this.player.setContentInfo(conf);      
         this.initPending = false;
         break;  
      }        
   }
});