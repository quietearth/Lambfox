/////////////////////////////////////////////
// Core global functions definitions.
/////////////////////////////////////////////
topictbl = '';
function bindHub(topic, callback, source, bindname) {
   if(!topictbl){
      topictbl = new TaneTable();
   }
   var bindlist = topictbl.get(topic);
   if(!bindlist){
      bindlist = [];
      bindlist[0] = bindname;
      topictbl.push(topic, bindlist);
   }else{
      for(i=0; i<bindlist.length; i++){
         if(bindlist[i]==bindname) break;
      }
      if(i==bindlist.length){
         bindlist.push(bindname);
      }
   }
   return $.subscribe(topic, callback.bind(source) );
}
function unbindHub(hundle, bindname) {
   for(l=0; l<topictbl.length; l++){
      var bindlist = topictbl[l].value;
      for(var i=0; i<bindlist.length; i++){
         if(bindlist[i] == bindname){
            var leftside = bindlist.slice(0,i);
            var rightside = bindlist.slice(i+1);
            bindlist = leftside.concat(rightside);
            topictbl[l].value = bindlist;
         }
      }
   }
   $.unsubscribe( hundle );
}
function isSubscribed(topic, name){
   var bindlist = topictbl.get(topic);
   if(!bindlist) return false;
   for(i=0; i<bindlist.length; i++){
      if(bindlist[i] && name && bindlist[i].match(name)) return true;
   }
   return false;
}

function pubEvent(event, data, topic, option) {
   simpleLogger("Publish", topic, event, data, option) ;
   var parms = [];
   if(option)
      parms = [topic, event, data, option];
   else
      parms = [topic, event, data];

   if(topic)
      $.publish( topic, parms);
   else
      return false;
}

function bindData(element, name, value) {
   var type = whatIsThis(value);
   switch(type){
   case "Object":
      var data = $.extend(true, {}, value);
      $(element).data(name, value);
      break;
   case "Array":
      var data = $.extend(true, [], value);
      $(element).data(name, value);
      break;
   default:
      var data = $.extend(true, '', value);
      $(element).data(name, value);
      break;
   }
}

function getBindData(element, name) {
   var value = $(element).data(name);
   var type = whatIsThis(value);
   switch(type){
   case "Object":
      return $.extend(true, {}, value);
   case "Array":
      return $.extend(true, [], value);
   default:
      return $.extend(true, '', value);
   }
}

function removeData(element, name) {
     $(element).removeData(name);
}

// Object Models
// Event object class functions
TaneEvent = function(name){
  this.eventtype = '';
  this.appname = '';
  this.eventname = '';
  this.From = name;
  this.To = 'na';
  this.Cc = '';
  this.callbacks = [];
  this.attributes = new TaneTable();
  this.hopcount = 0;
}
TaneEvent.prototype.copy = function(obj){
  this.eventtype = obj.eventtype; 
  this.appname = obj.appname;
  this.eventname = obj.eventname;
  this.From = obj.From;
  this.To = obj.To;
  this.Cc = obj.Cc;
  this.callbacks = obj.callbacks;
  this.attributes = obj.attributes;
  this.hopcount = obj.hopcount;
  return this;
}
TaneEvent.prototype.originName = function(orgname){
   if(orgname){
      this.From = orgname;
      return this;
   }else{
      return this.From;
   }
}
TaneEvent.prototype.destination = function(destname){
   if(destname){
      this.To = destname;
      return this;
   }else{
      return this.To;
   }
}
TaneEvent.prototype.cc = function(cc){
   if(cc){
      this.Cc = cc;
      return this;
   }
   else return this.Cc;
}
TaneEvent.prototype.eventName = function(event){
   if(event){
      this.eventname = event;
      return this;
   }else{
	  return this.eventname;
   }
}
TaneEvent.prototype.eventType = function(type){
   if(type){
      this.eventtype = type;
      return this;
   }else{
	  return this.eventtype;
   }
}
TaneEvent.prototype.appName = function(app){
   if(app){
      this.appname = app;
      return this;
   }else{
	   return this.appname;
   }
}
TaneEvent.prototype.attr = function(name, val){
   if(!name) return this.attributes.get();
   if(val){
   　　if(this.attributes.get(name)){
        this.attributes.set(name, val);
	  }else{
	     this.attributes.push(name, val);
	  }
	  return this;
   }else{
      if(name instanceof Array){
	     this.attributes.set(name);
		 return this.attribute;
	  }else{
	     return this.attributes.get(name);
	  }
  }
}
TaneEvent.prototype.getParm = function(key){
   if(!key) return this.attributes.get('parm');
	var parm = this.attributes.get('parm');
	if(!parm) return parm;
	else return parm[key];
}
TaneEvent.prototype.getStringParms = function(){
   var parms = this.attributes.get('parm');
   if(!parms) return parms;
   var strparms = "";
   Object.keys(parms).forEach(function(key){
      if(strparms != "") strparms += ";"
      var val = parms[key];
      strparms += key +"="+ val
   });
	return strparms;
}
TaneEvent.prototype.setParm = function(parm, val){
   if(!parm) return false;
   if(!val && !(parm instanceof String)){
      this.attributes.push('parm', parm);
      return this.attributes.get('parm');
   }
   if(this.attributes.get('parm'))
      this.attributes.get('parm')[parm] = val;
	else{
     this.attributes.set('parm', {})[parm] = val;
     var foo = null;
   }
   return this;
}
TaneEvent.prototype.setStringParms = function(parms){
   if(!parms) return false;
   if(!this.attributes.get('parm')) this.attributes.set('parm', {})

   var array = parms.split(';');
   array.forEach(function(keyval){
      var key = keyval.split('=')[0];
      var val = keyval.split('=')[1];
      this.attributes.get('parm')[key] = val;
   }.bind(this));
   return this;
}

TaneEvent.prototype.callback = function(callback){
   if(callback){
      this.callbacks.push(callback);
   }else{
      return this.callbacks;
   }
} 
TaneEvent.prototype.setHopcount = function(){
   this.hopcount = 1;
   return this;
}
TaneEvent.prototype.getHopcount = function(){
   return this.hopcount;
}



function splitPath(str){
   var array = str.split('/');
   if(str.charAt(0)=='/') var path ='/';
   else var path="";
   var id = "";

   for(var i=0; i<array.length; i++){
      if(i == array.length-1 && i > 0){
         id = array[i];
         break;
      }
     if(array[i]) var path = path + array[i] +'/';
   }
   return { path: path, id: id };
}

function getLast(str, sep){
   var array = str.split(sep);
   var last;
   array.forEach(function(sub){
      if(sub) last = sub;
   });
   return last;
}

function setLast(str, sep, rep){
   var last = getLast(str, sep);
   var front = str.split(last)[0];
   return front + rep;
}

function getFirst(str, sep){
   var array = str.split(sep);
   if(array.length==1) return null;
   else return array[0];
}

function whatIsThis(property){
   return Object.prototype.toString.call(property).slice(8, -1);
}

function findKeyValue(obj, key){
   var val;
   if(key.charAt(0)=='/') var start=1; else var start=0;
   if(key.charAt(key.length-1)=='/') var end=-1; else var end=key.length;
   var keypath = key.slice(start, end).split('/');
   for(var j=0; j<keypath.length; j++){
      var objkeys = Object.keys(obj);
      for(var i=0; i<objkeys.length; i++){
         if(objkeys[i].match(keypath[j])){
            val = obj[objkeys[i]];
            if(j+1==keypath.length) return val;
            else obj = val;
            break;
         }
      }
      if(i==objkeys.length) return null;
   }
   return null;
}

function matchRegExp(obj, key){
   if(key.charAt(0)=='/') var start=1;
   else var start=0;
   if(key.charAt(key.length-1)=='/') var end=-1; 
   else var end=key.length;
   
   var pathname='';
   var keypath = key.slice(start, end).split('/');
   for(var j=0; j<keypath.length; j++){
      var objkeys = Object.keys(obj);
      for(var i=0; i<objkeys.length; i++){
         if(objkeys[i].match(keypath[j])){
            if(pathname=='') pathname = objkeys[i];
            else pathname = pathname +'/'+ objkeys[i];
            if(j+1==keypath.length) return pathname;
            else obj = obj[objkeys[i]];       
            break;
         }else{
            if(i==objkeys.length-1) return false;
         }
      }
   }
   return false;
}


function matchPath(key1, key2){
   if(key1.charAt(0)=='/') var start=1;
   else var start = 0;
   if(key1.charAt(key1.length-1)=='/') var end=-1; 
   else var end = key1.length;
   var keypath1 = key1.slice(start, end).split('/');

   if(key2.charAt(0)=='/') var start=1;
   else var start = 0;
   if(key2.charAt(key2.length-1)=='/') var end=-1; 
   else var end = key2.length;
   var keypath2 = key2.slice(start, end).split('/');

   if(keypath1.length != keypath2.length) return false;
    
   for(var i=0; i<keypath1.length; i++)
      if(keypath1[i].match(keypath2[i])) return false;

   return true;
}

// {'Key', Value'} Mapping table utility
// Member Objects are assumed to consists of key/value pair.
// The first one is String as Key. The following one is any object associated with the key.
//  table {
//    "somekey": "someobject",
//    ".......": "..........",
//    ".......": "..........",
//  }
TaneTable = function(tbl){
   if(tbl instanceof Object) this.table=tbl;
   else this.table = {};
   this.selector = 0;
}
TaneTable.prototype.length = function(){
   return Object.keys(this.table).length;
}

TaneTable.prototype.get = function(key, value){
   if(key && !value) return this.table[key];
   if(key && value){
      var out;
      Object.keys(this.table).forEach(function(name){
         var keyval = findKeyValue(this.table[name], key);
         if(keyval && keyval.match(value)) out = this.table[name];
      }, this);
      return out;
   }
   else return this.table;
}

TaneTable.prototype.getBySelector = function(index){
   if(index == undefined) var index = this.selector;
   var i = 0;
   var val;
   Object.keys(this.table).forEach(function(key){
      if(i == index) val = this.table[key];
      i++;
   }, this);
   return val;
}

TaneTable.prototype.getFirst = function(){
   return this.getByIndex();
}

TaneTable.prototype.getLast = function(){
   var i = 0;
   for(var key in this.table) i++;
   if(!i) return null;
   return this.table[i-1];
}

TaneTable.prototype.set = function(key, val){
   if(!key) return false;
   if(!val) val = "";
   this.table[key] = val;
   return this.table[key];
}

TaneTable.prototype.add = function(obj, active){
   if(!obj) return null;
   var i = 0;
   for(var key in this.table) i++;
   this.table[i] = obj;
   if(active==true) this.selector = i;
   return true;
}

TaneTable.prototype.push = function(key, value, active){
   if(!key && !value) return null;
   if(!value && key instanceof Object){
      var tbl = _.extend(this.table, key);
      this.table = tbl;
	   return this.table;
   }
   var val = null;
   Object.keys(this.table).forEach(function(tblkey){
      if(key==tblkey) val = this.table[key];
   }, this);
   if(val) return true;
   else this.table[key] = value;
   var i = 0;
   if(active==true) for(var key in this.table) i++;
   this.selector = i;
   return true;
}

TaneTable.prototype.pop = function(){
   var data = this.table.getLast();
   delete this.table.delete(data);
   return data;
}
TaneTable.prototype.delete = function(data){
   var val = {};
   Object.keys(data).forEach(function(key){ val = data[key]; });
   var deleted = {};
   Object.keys(this.table).forEach(function(tblkey){
      if(this.table[tblkey] == key){
         deleted = this.table[tblkey];
         delete this.table[tblkey];
      }
   }, this);
   return deleted;
}

function clone(obj) {
   if (!obj || typeof obj != "object") return obj;
//   var copy = $.extend(new Object(), obj);
//   var copy = _.extend(_.extend({}, obj), obj.prototype);
   return $.extend(new Object(), obj);
//   for (var attr in obj) {
//      if (obj.hasOwnProperty(attr)){
//         copy[attr] = obj[attr] ? obj[attr] : '';
//      }
//   }
//   return copy;
}

function simpleLogger(text, topic, event, data, option){
   if(AAdebug){
var date = new Date();
var timestamp = date.getFullYear() +"/"+ date.getMonth() +"/"+ date.getDate() +" "+ date.getHours() +":"+ date.getMinutes() +":"+ date.getSeconds();   
      console.log(AASeqNo+" - "+timestamp +" "+text);      
      console.log(" event: "+event.eventName());
      console.log(" origin: "+event.originName());
      console.log(" destination: "+event.destination());
      console.log(" parm: "+event.getParm());
      console.log(" option: "+option);
      console.log(" topic: "+topic);      
      AASeqNo++;
   }
}
AAdebug = false;
AASeqNo = 0;

