///////////
// Input
///////////
var SimpleTextInput = TaneBaseView.extend({

  events: {
    "keyup": "keyin",
    "blur": "keyin"
  },
  model: '',
  _initialize: function(wid){
	  var ph = this.$el.attr('placeholder') || "";
	  if(this.type != "keyname" && this.keyname)
	     this.workingData.setData(this.keyname, ph);
     _.bindAll(this, 'keyin');
     this.$el.on('keyin');
  },
  localEventFilter: function(event, model, option){
     var val = model.getData(this.keyname);
     if(whatIsThis(val)=="String") return true;
     else return false;
  },  

  localEventListener: function(event, model){
     var val = model.getData(this.keyname);

     switch(event.eventName()){
     case "update":
     case "set":
        this.update(val);
        break;
     case "indexArraySelect":     
        this.$el.val(val);
        break;
     }        
  },
  keyin: function(e) {
    var val=$(e.target).val();
    this.workingData.setData(this.keyname, val);

    e.stopImmediatePropagation();
  },
  update: function(val){
//    var val = data[this.keyname] || '';
//    if(!val) return false;
    if(!val) val = "";
    this.$el.val(val);
    if(this.basepath) this.workingData.setData(this.basepath+'/'+this.keyname, val);
    else this.workingData.setData(this.keyname, val);
  },
  add: function(val){
//    var key=this.keyname;
//    var val = data[key];
//    if(!val) return false;
    if(val) var newval = this.$el.val()+val;
    else var newval = this.$el.val();
    this.$el.val(newval);
    if(this.type == "keyname") this.workingData.dataName(val);
    else this.workingData.setData(key, newval);
  },
})
