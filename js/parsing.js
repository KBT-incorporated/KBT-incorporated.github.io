var csvLink = "";
var classTree;
var newData = [];

	
d3.csv(csvLink, function(data) {
	data.forEach(function(d) {
		//Get the time into start and end times
		d.Time = parseTime(d.Time);
		//Make a properly formatted object
		for(var i = 0, c=''; c = d.Days.charAt(x); i++){ 
			newData.push(
				{"Department": d.Department,
				 "Course": d.Crse,
				 "Title": d.Title,
				 "Day": c,
				 "Location": d.Location.slice(0,d.Location.indexOf(' ')+1),
				 "Time": d.Time,
				 "Enrollment": d.Act,
				 "Size": 0
				})
		}
		delete d;
	});
	classTree = d3.nest()
		.key(function(d) {return d.Day;})
		.key(function(d) {return d.Location; })
		.key(function(d) {return d.Department; })
		.entries(data);

});

function parseTime(timeStr) {
	timeStr.replace(":","");
	timeStr.replace(" ","");
	timeStr.split("-");
	timeStr.forEach(function(d) {
		var addMe = 0;
		if(d.charAt[4] == 'p') {
			addMe = 1200;
		}
		d.substr(0,4);
		d = parseInt(d) + addMe;
	});
	return timeStr;
}

//
function timeQuery(tree, query) { //query is an array of the form [830, 1430]; MUST be in 24-hour time
	for(var key in tree) {
		if(key == "children") {
			for (item in tree.children) {
				timeQuery(tree.children[item], query));
			}
		}
		if(key == "Time") {
			tree.Size = 0;
			if((tree.Time[1] > query[0]) && (tree.Time[0] < query[1])) {
				tree.Size = tree.Enrollment;
			}
		}
	}
	return tree;
}

//the same one we know and love
function reNameTree(tree, value_key) {
	for(var key in tree) {
		if(key == "key") {
			tree.name = tree.key;
			delete tree.key;
		}
		if(key == "values") {
			tree.children = [];
			for (item in tree.values) {
				tree.children.push(reNameTree(tree.values[item],value_key));
			}
			delete tree.values;
		}
/*		if (key == value_key) {
			tree.value = parseFloat(tree[value_key]);
			delete tree[value_key];
		}
*/	}
	return tree;
}