var csvLink = "https://hivelab.org/static/coffee.csv";
var coffeeTree;

d3.csv(csvLink, function(d) {
	coffeeTree = d3.nest()
		.key(function(d) {return d.region; })
		.key(function(d) {return d.state; })
		.key(function(d) {return d.caffeination; })
		.key(function(d) {return d.type; })
		.entries(data);
});