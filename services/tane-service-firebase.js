(function($) {
// Firebase for tane.zero
   $.widget("tane.TaneFirebaseManager", $.tane.TaneServiceBase, {
      serviceInfo: {
         servicename: "firebase", 
		},
      apidef: [{"firebase":{}}],
      options: {
		   authdomain: 'firebaseapp.com',
		   dbdomain: 'firebaseio.com',		   
         config: {
            apiKey: "AIzaSyDs1cWOEUcevNTumoG25wGv3xdj4ENLtpI",
            authDomain: "lambfox2.firebaseapp.com",
            databaseURL: "https://lambfox2.firebaseio.com",
            projectId: "lambfox2",
            storageBucket: "lambfox2.appspot.com",
            messagingSenderId: "961193272013"
         },
         refIndex: [
//            {alias: 'guistore',		path: 'store/gui/', appAlias: 'tane0'},
//            {alias: 'apistore',		path: 'store/api/', appAlias: 'tane0'},
//            {alias: 'templatestore',path: 'store/template/', appAlias: 'tane0'},
//			   {alias: 'menus',		path: 'menus/', appAlias: 'someapp'},
//			   {alias: 'apps',		path: 'apps/', appAlias: 'someapp'},
//			   {alias: 'widgets',   path: 'widgets&type=gui', appAlias: 'tane0'}
         ]
      },
	   serviceInit(){
	      this.appAliasIndex = new TaneTable();
	      this.addGlobalEventHandler('*', this.fbGlobalEventHandler);
	   },
      globalEventAdapter(topic, event, dataModel, option){
         if(this.firebaseApp) return true;
         var project = event.getParm('project') || this.options.project;
         // Initialize Firebase
         this.options.config.authDomain = project+'.'+this.options.authdomain;
         this.options.config.databaseURL = 'https://'+project+'.'+this.options.dbdomain;
         this.options.config.projectId = project;       
         this.firebaseApp = firebase.initializeApp(this.options.config);	  	   
         return true;
      },
	  
      fbGlobalEventHandler: function(event, dataModel, option){

	      var project = event.getParm('project');
   		var pathname = event.getParm('pathname') || "";
   	   var qstr = event.getParm('qstr') || "";
   	   var path = splitPath(pathname).path;
   		var key = splitPath(pathname).id;

   		var op = event.eventName();
         switch(op) {
         case "create":
            var id = dataModel.getId();
            if(id instanceof Object) var keyname = JSON.stringify(id);
            else var keyname = id;
            path = path + keyname; 
            break;
         case "set":     
        	   var data = dataModel.getData();            
            firebase.database().ref(path).child(key).set(data);
      	   firebase.database().ref(pathname).on("value", function(dataSnapshot){
      			var name = dataSnapshot.toString().split(this.options.dbdomain+'/')[1];
      	   	var event2 = new TaneEvent(this.options.name); 	   	
		    	   event2.eventName('get>response').setParm('pathname', name).destination(event.originName());
      	      var newdata = new TaneModel();			
   				newdata.setData(dataSnapshot.val());		    	   
      	      newdata.dataName(pathname);		    	   
               this.pubGlobalEvent(event2, newdata);		            				
	         }.bind(this));			   
            break;
         case "get":
	  		   var dataModel = new TaneModel();          		      
 		      if(!qstr){
 		         firebase.database().ref(pathname).on("value", function(dataSnapshot){
         			var name = dataSnapshot.toString().split(this.options.dbdomain+'/')[1];
      	      	var event2 = new TaneEvent(this.options.name);
		       	   event2.eventName('get>response').setParm('pathname', pathname).destination(event.originName());
         	      var newdata = new TaneModel();			
      				newdata.setData(dataSnapshot.val());  				   
         	      newdata.dataName(pathname);			       	   
   	            this.pubGlobalEvent(event2, newdata);		            				      				
		         }.bind(this));		         
   	      }else{
   	         firebase.database().ref(pathname).orderByChild('type').on("value", function(snapshot){
         			var name = dataSnapshot.toString().split(this.options.dbdomain+'/')[1];
      	      	var event2 = new TaneEvent(this.options.name);
		       	   event2.eventName('get>response').setParm('pathname', name).destination(event.originName());
         	      var newdata = new TaneModel();			
      				newdata.setData(dataSnapshot.val());
         	      newdata.dataName(pathname);		    	   	       	   
   	            this.pubGlobalEvent(event2, newdata);		            				
   	         }.bind(this));
		      }
            break;
         case "remove":      
            firebase.database().child(rsname).remove();
            firebase.database().ref(pathname).on("value", function(snapshot){
      	      	var event2 = new TaneEvent(this.options.name);
		       	   event2.eventName('remove>response').setParm('pathname', name).destination(event.originName());
         	      var newdata = new TaneModel();			
      				newdata.setData(dataSnapshot.val());  				   
         	      newdata.dataName(pathname);			       	   
   	            this.pubGlobalEvent(event2, newdata);		            				      				
		         }.bind(this));		            
            break;
			case "signIn":			   
			   switch(dataModel.getData('provider')){
			   case 'email':  	var provider = new firebase.auth.EmailAuthProvider();
			                    	break;
			   case 'twitter':  	var provider = new firebase.auth.TwitterAuthProvider();
			                    	break;
			   case 'facebook': 	var provider = new firebase.auth.FacebookAuthProvider();
			                    	break;
			   case 'github':   	var provider = new firebase.auth.GithubAuthProvider();
			                    	break;
			   case 'google':   	var provider = new firebase.auth.GoogleAuthProvider();
			                    	break;
			   default:				
			      var email = dataModel.getData("email");
			   	var password = dataModel.getData("password");
			   	firebase.auth().onAuthStateChanged(function(user){
			         if(user){
							var event2 = new TaneEvent(this.options.name);
							event2.eventName('signIn>success').destination(event.originName());
						   var taneData = new TaneModel();
						   var hoge = user.uid;
					      this.pubGlobalEvent(event2, taneData, '');           
			         }else{
//			 		      var event = new TaneEvent('firebase').eventName('signIn>error');
   				      var taneData = null;
//							this.pubGlobalEvent(event, taneData, option);         
   			      }
   			   }.bind(this));
					firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
						var errorCode = error.code;
						var errorMessage = error.message;
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
               	event2.eventName('signIn>error');
		      	   var taneData = new TaneModel();
  					   taneData.setData('errorcode', errorCode);
  					   taneData.setData('message', errorMessage);   
  					   this.pubGlobalEvent(event2, taneData, option);
					}.bind(this));
					return;					
		   	}

				// Sign in with popup:
				firebase.auth().signInWithPopup(provider).then(
				   function(result){ // Success
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
				      event2.eventName('signIn>success'); 
				   	var user = result.user;
					   var credential = result.credential;
		      	   var taneData = new TaneModel();
  					   taneData.setData('user', user);
  					   taneData.setData('credential', credential);   
  					   this.pubGlobalEvent(event2, taneData, option);
				   }.bind(this),  
               function(result){ // Error
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
               	event2.eventName('signIn>error');
				   	var user = result.user;
					   var credential = result.credential;
		      	   var taneData = new TaneModel();
  					   taneData.setData('user', user);
  					   taneData.setData('credential', credential);   
  					   this.pubGlobalEvent(event2, taneData, option);
               }.bind(this)
            );
			   break;
			case "signOut":
				firebase.auth().signOut().then(
					function(result){ // Success
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
				      event2.eventName('signOut>success'); 
		      	   var taneData = new TaneModel();
  					   taneData.setData(result);
  					   this.pubGlobalEvent(event2, taneData, option);
					}.bind(this),
					function(error){ // Error
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
				      event2.eventName('signOut>error'); 
		      	   var taneData = new TaneModel();
  					   taneData.setData(result);
  					   this.pubGlobalEvent(event2, taneData, option);
					}.bind(this)
				);
				break;
			case "createUser":
		      var email = dataModel.getData("email");
		      var password = dataModel.getData("password");			      
		   	firebase.auth().createUserWithEmailAndPassword(email, password).then(
		   	 	function(user) { // Success
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
				      event2.eventName('createUser>success');
				    	var taneData = new TaneModel();	      
				    	taneData.setData('displayName', user.displayName);				      
				    	taneData.setData('email', user.email);   
				    	taneData.setData('uid', user.uid);				      
  					   this.pubGlobalEvent(event2, taneData, option);
					}.bind(this),
		   	 	function(error) { // Fail
      			   var event2 = new TaneEvent(this.options.name);
      			   event2.destination(event.originName());
				      event2.eventName('createUser>error'); 
				    	var taneData = new TaneModel();	      
				    	taneData.setData('code', error.code);				      
				    	taneData.setData('message', error.message);   
				    	taneData.setData('name', error.name);				      
  					   this.pubGlobalEvent(event2, taneData, option);
					}.bind(this)
				);
			   break
         }            
      },
   });
})(jQuery);
