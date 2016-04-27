Plants = new Mongo.Collection("plants");

var visjsobj;

var nodes; // = new Array();
var edges; // = new Array();
var data; // = {};

if (Meteor.isClient) {
  Meteor.subscribe("plants");

  Meteor.startup(function(){
     Session.set("selected_plant", null);
  });
  Template.companionplants_controller.helpers({
    get_plant: function(){
      return Plants.find({Companions: {$exists: true}}, {sort: {"Plant": 1}});
    }
  });

  Template.companionplants_visjs.helpers({
    get_plant_name: function(){
      var p = Plants.findOne({_id: Session.get("selected_plant")});
      return p.Plant
    },
    plant_selected: function(){
      if(Session.get("selected_plant")){
        return true;
      }
      else{
        return false;
      }
    }
  });

  Template.companionplants_controller.events({
    "click .js-show-companions": function(event){
      event.preventDefault();
      Session.set("selected_plant", null);
      populateData();
      companionNetworkVis();
    },
    "change .js-select-one-plant":function(event){
      event.preventDefault();
      Session.set("selected_plant", $(event.target).val());
      populateData();
      oneNetworkVis(Session.get("selected_plant"));
    },
    'click .js-show-incompatibles': function (event) {
      event.preventDefault();
      Session.set("selected_plant", null);
      populateData();
      incompatibleNetworkVis();
    }
  });
}

function incompatibleNetworkVis(){
  var selected_data = {};
  var selected_nodes = new Array();
  var selected_edges = new Array();
  var incompatible_color = $(".incompatible_color").css("background-color");

  if (visjsobj != undefined){
    visjsobj.destroy();
  }
  //select the companion edges
  for(var i = 0; i < edges.length; i++){
    var edge_obj = edges[i];
    if(edge_obj.color == incompatible_color){
      selected_edges.push(edge_obj);
    }
  }
  for(var i = 0; i < selected_edges.length; i++){
    var edge_obj = selected_edges[i];
    if(!nodeExists(selected_nodes, edge_obj.from)){
      selected_nodes.push(getNodeObj(edge_obj.from));
    }
    if(!nodeExists(selected_nodes, edge_obj.to)){
      selected_nodes.push(getNodeObj(edge_obj.to));
    }
  }

  selected_data = {
    nodes: selected_nodes,
    edges: selected_edges
  };
  container = document.getElementById("visjs");
  visjsobj = new vis.Network(container, selected_data, getOptions());

}
function companionNetworkVis(){
  var selected_data = {};
  var selected_nodes = new Array();
  var selected_edges = new Array();
  var companion_color = $(".companion_color").css("background-color");

  if (visjsobj != undefined){
    visjsobj.destroy();
  }

//vælger kun de edges som er companion
//vælger kun de noder som er tilknyttet de edges
//check både to og from

  //select the companion edges
  for(var i = 0; i < edges.length; i++){
    var edge_obj = edges[i];
    if(edge_obj.color == companion_color){
      selected_edges.push(edge_obj);
    }
  }
  for(var i = 0; i < selected_edges.length; i++){
    var edge_obj = selected_edges[i];
    if(!nodeExists(selected_nodes, edge_obj.from)){
      selected_nodes.push(getNodeObj(edge_obj.from));
    }
    if(!nodeExists(selected_nodes, edge_obj.to)){
      selected_nodes.push(getNodeObj(edge_obj.to));
    }
  }

  selected_data = {
    nodes: selected_nodes,
    edges: selected_edges
  };
  container = document.getElementById("visjs");
  visjsobj = new vis.Network(container, selected_data, getOptions());

}
function oneNetworkVis(id){
  var selected_data = {};
  var selected_nodes = new Array();
  var selected_edges = new Array();
  var level1_edges = getConnectedEdges(edges, id); //returns array of edge_id's

  if (visjsobj != undefined){
    visjsobj.destroy();
  }

  //insert the selected node
  selected_nodes.push(getNodeObj(id)); //returns the object

  //insert first edge object and to-nodes
  for(var i = 0; i < level1_edges.length; i++){
    //push the edge object into the array
    var level1_edge = getEdgeObj(level1_edges[i]);
    if(!edgeExists(selected_edges, level1_edge)){
      selected_edges.push(level1_edge);
    }
    //get the to-node object
    var level2_node = getNodeObj(level1_edge.to);
    if(!nodeExists(selected_nodes, level2_node.id)){
      selected_nodes.push(level2_node);
    }
    //get this nodes edges
    var level2_edges = getConnectedEdges(edges, level2_node.id);
    if(level2_edges){
      for(var j = 0; j < level2_edges.length; j++){

        var level2_edge = getEdgeObj(level2_edges[j]);
        if(!edgeExists(selected_edges, level2_edge)){
          selected_edges.push(level2_edge);
        }

        var level3_node = getNodeObj(level2_edge.to);
        if(!nodeExists(selected_nodes, level3_node.id)){
          selected_nodes.push(level3_node);
        }
      }
    }
  }
  selected_data = {
    nodes: selected_nodes,
    edges: selected_edges
  };
  container = document.getElementById("visjs");
  visjsobj = new vis.Network(container, selected_data, getOptions());
}
function getConnectedEdges(all_edges, id){
  //returns an array with all the ids of the edges with from node-id
  var con_edges = new Array();
  var edge_obj;
  for(var i = 0; i < all_edges.length; i++){
    edge_obj = all_edges[i];
    if(edge_obj.from == id){
      con_edges.push(edge_obj.id);
    }
  }
  return con_edges;
}
function getNodeObj(id){
  for(var i = 0; i < nodes.length; i++){
    if(nodes[i].id == id){
      return nodes[i];
    }
  }
}
function getEdgeObj(id){
  for(var i = 0; i < edges.length; i++){
    if(edges[i].id == id){
      return edges[i];
    }
  }
}
function nodeExists(arr, id){
  for(var i = 0; i < arr.length; i++){
    if(arr[i].id == id){
      return true;
    }
  }
  return false;
}
function edgeExists(arr, id){
  for(var i = 0; i < arr.length; i++){
    if(arr[i].id == id){
      return true;
    }
  }
  return false;
}

function getOptions(){
  var options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    interaction:{
      dragNodes:true,
      hoverConnectedEdges: true,
      selectable: true,
      selectConnectedEdges: true,
      zoomView: true
    },
    physics:{
      enabled: false
    }
  };
  return options;
}

function populateData(){
  // læser ind alle data ind i noder og edges
  // der findes to slags edges: val 1 (companion), val 2 (incompatible)

  nodes = new Array();
  edges = new Array();
  data = {};
  var edge_id = 1;
var companion_color = $(".companion_color").css("background-color");
var incompatible_color = $(".incompatible_color").css("background-color");
var node_has_edges_color = $(".node_has_edges_color").css("background-color");
var node_no_edges_color = $(".node_no_edges_color").css("background-color");

  var has_edges;
  var plants = Plants.find({});

  plants.forEach(function(plant){
    has_edges = false;
    if(plant.Companions){
      for(var i = 0; i < plant.Companions.length; i++){
        edges.push({
          id: edge_id,
          from: plant._id,
          to: plant.Companions[i]._id,
          color: companion_color,
        });
        edge_id ++;
      }
      has_edges = true;
    }
    if(plant.Incompatible){
      for(var i = 0; i < plant.Incompatible.length; i++){
        edges.push({
          id: edge_id,
          from: plant._id,
          to: plant.Incompatible[i]._id,
          color: incompatible_color,
        });
        edge_id ++;
      }
      has_edges = true;
    }
    if(has_edges){
      nodes.push({
        id: plant._id,
        label: plant.Plant,
        color: node_has_edges_color,
      });
    }else{
      nodes.push({
        id: plant._id,
        label: plant.Plant,
        color: node_no_edges_color,
      });
    }
  })
  data = {
    nodes: nodes,
    edges: edges
  };
}

if (Meteor.isServer) {

  Meteor.publish('plants', function plantsPublication(){
    return Plants.find();
  });
}
