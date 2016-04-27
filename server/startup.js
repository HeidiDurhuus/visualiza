Meteor.startup(function(){
  if(!Plants.findOne()){
    console.log("No plants in db. Reading from file");

    fromXmlToDb();
    console.log("there are now: " + Plants.find({}).count() + " plants");

    console.log("Companions");
    giveAllCompanionsID();
    console.log("there are now: " + Plants.find({}).count() + " plants");

    console.log("Incompatible");
    giveAllIncompatiblesID();
    console.log("there are now: " + Plants.find({}).count() + " plants");
  }
});

function fromXmlToDb(){
  //read from xml file
  var xml = Assets.getText('CompanionPlants.xml');
  //represents node structure from xml file
  var nodes = {
    level1: "CompanionPlants",
    level2: "Plants",
    level3:["PlantID", "Plant", "Companions", "Incompatible", "Benefits", "Type", "ScientificName"]
  };
  var sTag = "<";
  var eTag = ">";
  var seTag  = "</";

  //level1
  xml = xml.substring(
  xml.indexOf(sTag + nodes.level1 + eTag) + (sTag + nodes.level1 + eTag).length,
  xml.indexOf(seTag + nodes.level1 + eTag));

  //level2 and level3
  var level2xml = "";
  var plant = {};

  while(xml.length > 2){ //for some reason there are two characters left, probably whitespace
    level2xml = xml.substring(0, xml.indexOf(seTag + nodes.level2 + eTag) + (seTag + nodes.level2 + eTag).length);
    xml = xml.substring(level2xml.length);
    for(var i = 0; i < nodes.level3.length; i++){
      if(level2xml.indexOf(nodes.level3[i]) > -1){
        plant[nodes.level3[i]] = level2xml.substring(
          level2xml.indexOf(sTag + nodes.level3[i] + eTag) + (sTag + nodes.level3[i] + eTag).length,
          level2xml.indexOf(seTag + nodes.level3[i] + eTag)).trim();
      }
    }
    //put companions in a table and remove spaces
    var companions = plant.Companions.split(",");
    for(var j = 0; j < companions.length; j++){
      companions[j] = companions[j].trim();
    }
    plant.Companions = companions;

    //put incompatible in a table and remove spaces
    if(plant.Incompatible.length > -1){
      var incompatible = plant.Incompatible.split(",");
      for(var j = 0; j < incompatible.length; j++){
        incompatible[j] = incompatible[j].trim();
      }
      plant.Incompatible = incompatible;
    }
    //insert into db
    Plants.insert(plant);
    plant = {};
  }
}
function giveAllIncompatiblesID(){
  var new_plants = [];
  var planter = Plants.find({});

  planter.forEach(function(plant){
    var incompatible = plant.Incompatible;
    if(!incompatible){
      incompatible = [];
    }
    for(var i = 0; i < incompatible.length; i++){
      if(!Plants.findOne({"Plant": incompatible[i]})){
        if(!arrayContains(new_plants, incompatible[i])){
          new_plants.push(plant.Incompatible[i]);
        }
      }
    }
  })
  for(var i = 0; i < new_plants.length; i++){
    Plants.insert({"Plant": new_plants[i]});
  }

  Plants.find({}).forEach(function(plant){
    new_plants = [];
    var incompatible_obj = {};
    var incompatible = plant.Incompatible;
    if(incompatible){
      for(var i = 0; i < incompatible.length; i++){
        incompatible_obj = Plants.findOne({"Plant": incompatible[i]});
        if(incompatible_obj){
          incompatible_obj = {"_id": incompatible_obj._id, "Plant": incompatible_obj.Plant};
          new_plants.push(incompatible_obj);
        }
      }
      Plants.update({_id:plant._id}, {$set:{Incompatible: new_plants}});
    }
  })

}
function giveAllCompanionsID(){
  //alle planter skal have en ID

  //ny plan:
  //1.iteration: hvis companion ikke eksisterer,
  //check om findes i tabel ellers læg i tabel
  //insert alle nye fra tabel.
  //2.iteration: indsæt _id ud for hver companion

  var new_plants = [];
  var planter = Plants.find({});

  planter.forEach(function(plant){
    var companions = plant.Companions;
    if(!companions){
      companions = [];
    }
    for(var i = 0; i < companions.length; i++){
      if(!Plants.findOne({"Plant": companions[i]})){
        if(!arrayContains(new_plants, companions[i])){
          new_plants.push(plant.Companions[i]);
        }
      }
    }
  })
  for(var i = 0; i < new_plants.length; i++){
    Plants.insert({"Plant": new_plants[i]});
  }

  Plants.find({}).forEach(function(plant){
    new_plants = [];
    var companion_obj = {};
    var companions = plant.Companions;
    if(companions){
      for(var i = 0; i < companions.length; i++){
        companion_obj = Plants.findOne({"Plant": companions[i]});
        if(!companion_obj){
          console.log("not found: " + companions[i]);
        }
        if(companion_obj){
          companion_obj = {"_id": companion_obj._id, "Plant": companion_obj.Plant};
          new_plants.push(companion_obj);
        }
      }
      Plants.update({_id:plant._id}, {$set:{Companions: new_plants}});
    }
  })
}

function arrayContains(a, str){
  for(var i = 0; i < a.length; i++){
    if(a[i] === str){
      return true;
    }
  }
  return false;
}
