 var db = require("./db").connect();
 var User = db.model('User');
 var Presentation = db.model('Presentation');

exports.findPresentationById = function(id,callback) {
  var presentation = Presentation.findById(id, function(err,presentation){
    callback(err,presentation);
  });
}

exports.createPresentation = function(user,json,callback) {
  var presentation = getPresentationObjectFromJson(user, json);

  presentation.save( function(err){
    if(err){
    	callback(err,null);
    } else {
      var presentationId = presentation._id.toHexString();
      //save the presentation id in the user presentations array
      user.presentations.push(presentationId);
      user.save(function(err){
        if(err){
          	callback(err,presentationId);
        } else {
        	callback(err,presentationId);
        }
      });
    }
  });
}

exports.updatePresentation = function(user,json,callback) {
  var presentation = getPresentationObjectFromJson(user, json);

  presentation.save( function(err){
    if(err){
      callback(err,null);
    } 
  });
}

var getPresentationObjectFromJson = function(user, json){
  var presentation;
  var presentationJson = JSON.parse(json);
  if(presentationJson.id !== ""){
    api.findPresentationById(presentationJson.id,function(err,presentation){
      if(err){
        res.render('home');
      } 
    });
  }
  else{
    presentation = new Presentation();
  }

  presentation.title = presentationJson.title;
  presentation.description = presentationJson.description;
  presentation.avatar = presentationJson.avatar;
  presentation.tags = presentationJson.tags;
  presentation.author = user._id.toHexString();
  presentation.content = json;  
  return presentation;
}

exports.findAllPresentationsOfUser = function(userId,callback) {
  var presentations = Presentation.find({author: userId}, function(err,presentations){
    callback(err,presentations);
  });
}

exports.findUserById = function(userId,callback) {
  var user = User.findById(userId, function(err,user){
    callback(err,user);
  });
}