if(Meteor.isClient){
  Template.header.helpers({
    isClicked: function(num){
        if(Session.get("btn"+num) == 1){
          return true;
        }else {
          return false;
        }
    },
  });

  Template.header.events({
    "click .js-home": function(event, template){
       Session.set("btn1", 1);
       Session.set("btn2", 0);
       Session.set("btn3", 0);

    },
    "click .js-about": function(event, template){
      Session.set("btn1", 0);
      Session.set("btn2", 1);
      Session.set("btn3", 0);
    },
    "click .js-credit": function(event, template){
      Session.set("btn1", 0);
      Session.set("btn2", 0);
      Session.set("btn3", 1);

    }
  });

}
