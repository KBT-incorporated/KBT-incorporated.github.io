//declare the big constant variables
var csvLink = "http://KBT-Incorporated.github.io/js/cleanCourseData.csv";
var margin = {top: 40, right: 10, bottom: 10, left: 10};

var courseTree;
var newData = [];
var myTime = [930,1320];

function timeQuery(tree, query) { //query is an array of the form [830, 1430]; MUST be in 24-hour time
	for(var key in tree) {
		if(key == "children") {
			for (item in tree.children) {
				timeQuery(tree.children[item], query);
			}
		}
		if(key == "Time") {
			tree.value = 0;
			console.log(tree.Time);
			if((tree.Time[1] > query[0]) && (tree.Time[0] < query[1])) {
				tree.value = tree.Enrollment;
				console.log(tree.value);
			}
		}
	}
	return tree;
}

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy) + "px"; });
}

function parseTime(timeStr) {
	var addMe = 0;
	timeStr = timeStr.replace(":","");
	timeStr = timeStr.replace(":","");
	timeStr = timeStr.split("-");
	if(timeStr[0].charAt[4] == 'p') {addMe = 1200;}
	timeStr[0] = timeStr[0].substr(0,4);
	timeStr[0] = parseInt(timeStr[0]) + addMe;
	if(timeStr[1].charAt[4] == 'p') {addMe = 1200;}
	timeStr[1] = timeStr[1].substr(0,4);
	timeStr[1] = parseInt(timeStr[1]) + addMe;
	console.log(timeStr);
	return timeStr;
}

function reNameTree(tree) {
	for(var key in tree) {
		if(key == "key") {
			tree.name = tree.key;
			delete tree.key;
		}
		if(key == "values") {
			tree.children = [];
			for (item in tree.values) {
				tree.children.push(reNameTree(tree.values[item]));
			}
			delete tree.values;
		}
	}
	return tree;
}
		
d3.csv(csvLink, function(data) {
	data.forEach(function(d) {
		//Get the time into start and end times
		d.Time = parseTime(d.Time);
		//Make a properly formatted object
		for(var i = 0, c=''; c = d.Days.charAt(i); i++){ 
			newData.push(
				{"Department": d.Department,
				 "Course": d.Crse,
				 "Title": d.Title,
				 "Day": c,
				 "Location": d.Location.slice(0,d.Location.indexOf(' ')),
				 "Time": d.Time,
				 "Enrollment": d.Act,
				 "value": d.Act
				})
		}
	});
	courseTree = {"key": "Purdue Courses", "values": d3.nest()
		.key(function(d) {return d.Day;})
		.key(function(d) {return d.Location; })
		.key(function(d) {return d.Department; })
		.entries(newData)
		};

		// define width and height based on the margin
	var width = 1100 - margin.left - margin.right;
	var height = 600 - margin.top - margin.bottom;
	
	
	//Format the new data for the treemap
	courseTree = reNameTree(courseTree);
	
	//Demonstrate timeQuery
	courseTree = timeQuery(courseTree, myTime);
	
	//Generate the Treemap
	var treemap = d3.layout.treemap()
		.size([width, height])
		.padding([14,0,0,0])
		.sticky(true)
		.value(function(d) { return d.value; });

	var div = d3.select("#treediv")
		.style("position", "relative")
		.style("width", (width + margin.left + margin.right) + "px")
		.style("height", (height + margin.top + margin.bottom) + "px")
		.style("left", margin.left + "px")
		.style("top", margin.top + "px");

	var node = div.datum(courseTree.children[2]).selectAll(".node")
		.data(treemap.nodes)
		.enter()
		.append("div")
		.attr("class", "node")
		.call(position)
		.style("background", function(d) {
			if(d.Department === "AAE") {
				return "#FF0000";
			} else if(d.Department === "ABE") {
				return "#FF9900";
			} else if(d.Department === "BME") {
				return "#669900";
			} else if(d.Department === "CE") {
				return "#009900";
			} else if(d.Department === "CEM") {
				return "#00CC66";
			} else if(d.Department === "CHE") {
				return "#0000FF";
			} else if(d.Department === "ECE") {
				return "#CC0099";
			} else if(d.Department === "IE") {
				return "#000066";
			} else if(d.Department === "ME") {
				return "#99CCFF";
			} else if(d.Department === "MSE") {
				return "#FFFF00";
			} else if(d.Department === "NUCL") {
				return "#FF3300";
			}
			return "#291400";
			})
		.text(function(d) { return d.name; });
});
