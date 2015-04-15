var csvLink = "../Data/Spring15Course.csv";
var classTree;

d3.csv(csvLink, function(data) {
	data.forEach( function(d) {
		//remove the room number from the class location
		d.Location = d.Location.slice(0,d.Location.indexOf(' ')+1);
	});
	classTree = d3.nest()
		.key(function(d) {return d.Location; })
		.key(function(d) {return d.Department; })
		.entries(data);
});