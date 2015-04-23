var checkClick = 1;
    var chartWidth = 550;
    var chartHeight = 550;
    var xscale = d3.scale.linear().range([0, chartWidth]);
    var yscale = d3.scale.linear().range([0, chartHeight]);
    var color = d3.scale.category20();
    var headerHeight = 15;
    var headerColor = "#555555";
    var transitionDuration = 500;

    var parents = [];
    var children = [];

    var qTime = [1030, 1130];
    var qDay = "M";
    
    var courseTree;
    var newData = [];

    var root;
 
    var csvLink = "cleanCourseData.csv";
    var node;

    var treemap = d3.layout.treemap()
        .size([chartWidth, chartHeight])
        .sticky(false)
        .value(function(d) { 
            console.log("T : " + d)
            return d.size });

    var treemapZoom = d3.layout.treemap()
        .size([chartWidth, chartHeight])
        .sticky(true)
        .value(function(d) { 
            console.log("Tzoom : " + d)
            return d.size });    
  
    var chart = d3.select("#body")
        .append("svg:svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .append("svg:g");

    d3.csv(csvLink, function(data) {
 

        data.forEach(function(d) {
            //Get the time into start and end times
            d.Time = parseTime(d.Time);
            //Make a properly formatted object
            for(var i = 0, c=''; c = d.Days.charAt(i); i++){ 
                if (d.Act != 0) {
                    newData.push(
                        {"Department": d.Department,
                         "Course": d.Crse,
                         "Sec": d.Sec,
                         "Title": d.Title,
                         "Day": c,
                         "Location": "(B) " + d.Location.slice(0,d.Location.indexOf(' ')),
                         "Time": d.Time,
                         "Enrollment": d.Act,
                         "value": d.Act
                        })
                }
            }
        });

        courseTree = {"key": "Purdue Courses", "values": d3.nest()
            .key(function(d) {return d.Day;})
            .key(function(d) {return d.Location; })
            .key(function(d) {return d.Department; })
            .entries(newData)
            };

        //Demonstrate timeQuery
        courseTree = timeQuery(courseTree, qTime);

        var root = courseTree; 
        root = courseTree.values[findIndex(courseTree.values, qDay)];
        root = reNameTree(root, "value", "Title");        

        var nodes = treemap.nodes(root);
        node = root;

        //var t = node;

        //console.log(t)

        var CFilter = nodes.filter(function(d) { return !d.children; });
        var PFilter = nodes.filter(function(d) { return d.children; });

        for(var i=0; i < CFilter.length; i++) { if(CFilter[i].value !== 0){ children.push(CFilter[i]); } };
        for(var i=0; i < PFilter.length; i++) { if(PFilter[i].value !== 0){ parents.push(PFilter[i]); } };

        // Parent cells
        var parentCells = chart.selectAll("g.cell.parent")
            .data(parents, function(d) { 
                //console.log(d.children[0].name + d.name)
                //console.log(d.children[0].Course)
                return d.children[0].Course + d.name + d.children[0].name; }); 
        
        var parentEnterTransition = parentCells.enter()
            .append("g")
            .attr("class", "cell parent")
            .on("click", function(d) { 
                checkClick = 0; 
                zoom(d); 
            });            
            parentEnterTransition.append("rect")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", headerHeight)
            .style("fill", headerColor);           
            parentEnterTransition.append("foreignObject").attr("class", "foreignObject")
            .append("xhtml:body").attr("class", "labelbody")
            .append("div").attr("class", "label");

        // update transition
        var parentUpdateTransition = parentCells.transition().duration(transitionDuration);
        parentUpdateTransition.select(".cell")
            .attr("transform", function(d) { return "translate(" + d.dx + "," + d.y + ")"; });
        parentUpdateTransition.select("rect")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", headerHeight)
            .style("fill", headerColor);
        parentUpdateTransition.select(".foreignObject")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", headerHeight)
            .select(".labelbody .label")
            .text(function(d) { return d.children[0].Course + d.name + d.children[0].name;});
        
        // remove transition
        parentCells.exit().remove();

        // Children cells
        var childrenCells = chart.selectAll("g.cell.child")
            .data(children, function(d) { return d.Department + d.Sec + d.name; }); 
        
        // Enter transition
        var childEnterTransition = childrenCells.enter()
            .append("g")
            .attr("class", "cell child")
            .on("click", function(d) {   
                //treemapZoom.sticky(true);       
                checkClick = 0; 
                console.log("Check 1")
                zoom(node === d.parent ? root : d.parent); 
            });
        childEnterTransition.append("rect")
            .classed("background", true)
            .style("fill", function(d) { 
                //console.log(d.parent.name)
                return color(d.parent.name); });
        childEnterTransition.append('foreignObject')
            .attr("class", "foreignObject")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", function(d) { return Math.max(0.01, d.dy); })
            .append("xhtml:body")
            .attr("class", "labelbody")
            .append("div")
            .attr("class", "label")   
            .text(function(d) { return d.Department + d.Sec + d.name; }); 

        // update transition
        var childUpdateTransition = childrenCells.transition().duration(transitionDuration);
        childUpdateTransition.select(".cell")
            .attr("transform", function(d) { return "translate(" + d.x  + "," + d.y + ")"; });
        childUpdateTransition.select("rect")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", function(d) { return d.dy; })
            .style("fill", function(d) { return color(d.parent.name); });
        childUpdateTransition.select(".foreignObject")
            .attr("width", function(d) { return Math.max(0.01, d.dx); })
            .attr("height", function(d) { return Math.max(0.01, d.dy); })
            .select(".labelbody .label")
            .text(function(d) { return d.Department + d.Sec + d.name; });

        // exit transition
        childrenCells.exit().remove();

        if (checkClick) {
            checkClick = 0;
            childEnterTransition.selectAll(".foreignObject").style("display", "none");
        } else {
            checkClick = 1;
            childEnterTransition.selectAll(".foreignObject .labelbody .label").style("display", "none");
        }

        console.log("B Point")
        zoom(node);

    });

    function updateData(selection) {
        
        var parents = [];
        var children = [];
        var courseTree;
        var newData = [];
        var root;

        var qDay; 
        var qTime; 

        //Change Day and Time
        if(selection == 0) { qDay = "M";  qTime = [730, 830]; }
        if(selection == 1) { qDay = "M";  qTime = [830, 930]; }
        if(selection == 2) { qDay = "M";  qTime = [930, 1030]; }
        if(selection == 3) { qDay = "M";  qTime = [1030, 1130]; }
        if(selection == 4) { qDay = "M";  qTime = [1130, 1230]; }
        if(selection == 5) { qDay = "M";  qTime = [1230, 130]; }
        if(selection == 6) { qDay = "M";  qTime = [130, 230]; }
        if(selection == 7) { qDay = "M";  qTime = [230, 330]; }
        if(selection == 8) { qDay = "M";  qTime = [330, 430]; }
        if(selection == 9) { qDay = "M";  qTime = [430, 530]; }
        if(selection == 10) { qDay = "M";  qTime = [530, 630]; }

        if(selection == 11) { qDay = "T";  qTime = [730, 830]; }
        if(selection == 12) { qDay = "T";  qTime = [830, 930]; }
        if(selection == 13) { qDay = "T";  qTime = [930, 1030]; }
        if(selection == 14) { qDay = "T";  qTime = [1030, 1130]; }
        if(selection == 15) { qDay = "T";  qTime = [1130, 1230]; }
        if(selection == 16) { qDay = "T";  qTime = [1230, 130]; }
        if(selection == 17) { qDay = "T";  qTime = [130, 230]; }
        if(selection == 18) { qDay = "T";  qTime = [230, 330]; }
        if(selection == 19) { qDay = "T";  qTime = [330, 430]; }
        if(selection == 20) { qDay = "T";  qTime = [430, 530]; }
        if(selection == 21) { qDay = "T";  qTime = [530, 630]; }

        if(selection == 22) { qDay = "W";  qTime = [730, 830]; }
        if(selection == 23) { qDay = "W";  qTime = [830, 930]; }
        if(selection == 24) { qDay = "W";  qTime = [930, 1030]; }
        if(selection == 25) { qDay = "W";  qTime = [1030, 1130]; }
        if(selection == 26) { qDay = "W";  qTime = [1130, 1230]; }
        if(selection == 27) { qDay = "W";  qTime = [1230, 130]; }
        if(selection == 28) { qDay = "W";  qTime = [130, 230]; }
        if(selection == 29) { qDay = "W";  qTime = [230, 330]; }
        if(selection == 30) { qDay = "W";  qTime = [330, 430]; }
        if(selection == 31) { qDay = "W";  qTime = [430, 530]; }
        if(selection == 32) { qDay = "W";  qTime = [530, 630]; }

        if(selection == 33) { qDay = "R";  qTime = [730, 830]; }
        if(selection == 34) { qDay = "R";  qTime = [830, 930]; }
        if(selection == 35) { qDay = "R";  qTime = [930, 1030]; }
        if(selection == 36) { qDay = "R";  qTime = [1030, 1130]; }
        if(selection == 37) { qDay = "R";  qTime = [1130, 1230]; }
        if(selection == 38) { qDay = "R";  qTime = [1230, 130]; }
        if(selection == 39) { qDay = "R";  qTime = [130, 230]; }
        if(selection == 40) { qDay = "R";  qTime = [230, 330]; }
        if(selection == 41) { qDay = "R";  qTime = [330, 430]; }
        if(selection == 42) { qDay = "R";  qTime = [430, 530]; }
        if(selection == 43) { qDay = "R";  qTime = [530, 630]; }

        if(selection == 44) { qDay = "F";  qTime = [730, 830]; }
        if(selection == 45) { qDay = "F";  qTime = [830, 930]; }
        if(selection == 46) { qDay = "F";  qTime = [930, 1030]; }
        if(selection == 47) { qDay = "F";  qTime = [1030, 1130]; }
        if(selection == 48) { qDay = "F";  qTime = [1130, 1230]; }
        if(selection == 49) { qDay = "F";  qTime = [1230, 130]; }
        if(selection == 50) { qDay = "F";  qTime = [130, 230]; }
        if(selection == 51) { qDay = "F";  qTime = [230, 330]; }
        if(selection == 52) { qDay = "F";  qTime = [330, 430]; }
        if(selection == 53) { qDay = "F";  qTime = [430, 530]; }
        if(selection == 54) { qDay = "F";  qTime = [530, 630]; }

        //console.log("C Point")
        //treemap.sticky(false);
        //console.log(checkClick)
        checkClick = 1;
        treemapZoom.sticky(false);
        treemapZoom.sticky(true);

        d3.csv(csvLink, function(data) {

           // treemapZoom.sticky(true);

            data.forEach(function(d) {
                //Get the time into start and end times
                d.Time = parseTime(d.Time);
                //Make a properly formatted object
                for(var i = 0, c=''; c = d.Days.charAt(i); i++){ 
                    //console.log("Taejin " + d.Act);
                    if (d.Act != 0) {
                        //console.log("Taejin " + d.Act);
                        newData.push(
                            {"Department": d.Department,
                             "Course": d.Crse,
                             "Sec": d.Sec,
                             "Title": d.Title,
                             "Day": c,
                             "Location": "(B) " + d.Location.slice(0,d.Location.indexOf(' ')),
                             "Time": d.Time,
                             "Enrollment": d.Act,
                             "value": d.Act
                            })
                    }
                }
            });

            courseTree = {"key": "Purdue Courses", "values": d3.nest()
                .key(function(d) {return d.Day;})
                .key(function(d) {return d.Location; })
                .key(function(d) {return d.Department; })
                .entries(newData)
                };


            courseTree = timeQuery(courseTree, qTime);
            var root = courseTree; 
            root = courseTree.values[findIndex(courseTree.values, qDay)];
            root = reNameTree(root, "value", "Title"); 
            
            var nodes = treemap.nodes(root);    
            node = root;

            

            var CFilter = nodes.filter(function(d) { return !d.children; });
            var PFilter = nodes.filter(function(d) { return d.children; });

            for(var i=0; i < CFilter.length; i++) { if(CFilter[i].value !== 0){ children.push(CFilter[i]); } };
            for(var i=0; i < PFilter.length; i++) { if(PFilter[i].value !== 0){ parents.push(PFilter[i]); } };     

            // Parent cells
            var parentCells = chart.selectAll("g.cell.parent")
                .data(parents, function(d) { return d.children[0].name+ d.name; }); 
            
            var parentEnterTransition = parentCells.enter()
                .append("g")
                .attr("class", "cell parent")
                .on("click", function(d) { 
                    checkClick = 0; 
                    zoom(d); 
                });            
                parentEnterTransition.append("rect")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", headerHeight)
                .style("fill", headerColor);           
                parentEnterTransition.append("foreignObject").attr("class", "foreignObject")
                .append("xhtml:body").attr("class", "labelbody")
                .append("div").attr("class", "label");

            //update transition
            var parentUpdateTransition = parentCells.transition().duration(transitionDuration);
            parentUpdateTransition.select(".cell")
                .attr("transform", function(d) { return "translate(" + d.dx + "," + d.y + ")"; });
            parentUpdateTransition.select("rect")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", headerHeight)
                .style("fill", headerColor);
            parentUpdateTransition.select(".foreignObject")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", headerHeight)
                .select(".labelbody .label")
                .text(function(d) { return d.children[0].name + d.name;;});
            
            // remove transition
            parentCells.exit().remove();

            // Children cells
            var childrenCells = chart.selectAll("g.cell.child")
                .data(children, function(d) { return d.Department + d.Sec + d.name; }); 
            
            // Enter transition
            var childEnterTransition = childrenCells.enter()
                .append("g")
                .attr("class", "cell child")
                .on("click", function(d) {        
                    checkClick = 0; 
                    console.log("Check 2")
                    //treemapZoom.sticky(true);
                    zoom(node === d.parent ? root : d.parent); 
                });
            childEnterTransition.append("rect")
                .classed("background", true)
                .style("fill", function(d) { return color(d.parent.name); });
            childEnterTransition.append('foreignObject')
                .attr("class", "foreignObject")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", function(d) { return Math.max(0.01, d.dy); })
                .append("xhtml:body")
                .attr("class", "labelbody")
                .append("div")
                .attr("class", "label")   
                .text(function(d) { return d.Department + d.Sec + d.name; }); 

            //update transition
            var childUpdateTransition = childrenCells.transition().duration(transitionDuration);
            childUpdateTransition.select(".cell")
                .attr("transform", function(d) { return "translate(" + d.x  + "," + d.y + ")"; });
            childUpdateTransition.select("rect")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", function(d) { return d.dy; })
                .style("fill", function(d) { return color(d.parent.name); });
            childUpdateTransition.select(".foreignObject")
                .attr("width", function(d) { return Math.max(0.01, d.dx); })
                .attr("height", function(d) { return Math.max(0.01, d.dy); })
                .select(".labelbody .label")
                .text(function(d) { return d.Department + d.Sec + d.name; });

            // exit transition
            childrenCells.exit().remove();

            if (checkClick) {
                checkClick = 0;
                childEnterTransition.selectAll(".foreignObject").style("display", "none");
            } else {
                checkClick = 1;
                childEnterTransition.selectAll(".foreignObject .labelbody .label").style("display", "none");
            }

            //treemapZoom.sticky(true);
            zoom(node);
        });
    }
        
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

    function timeQuery(tree, query) { //query is an array of the form [830, 1430]; MUST be in 24-hour time

        var temp = tree;

        for(var key in tree) {


            if(key == "values") {
                for (item in tree.values) {
                    timeQuery(tree.values[item], query);
                }
            }
            if(key == "Time") {
                tree.value = 0;
                if((tree.Time[1] > query[0]) && (tree.Time[0] < query[1])) {
                    tree.value = tree.Enrollment;
                }
            }



        }
        return tree;
    }

    function findIndex(myList, myKey) {
        for(var i = 0, l = myList.length; i < l; i++) {
            if(myList[i].key == myKey) {
                //console.log(i);
                return i;}
        }
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
        return timeStr;
    }

    function reNameTree(tree, value_key, value_name) {
        
        //var value_key = value_key; 

        //console.log("D" + value_key);

        for(var key in tree) {
            //console.log(key);
            if(key == "key") {
                tree.name = tree.key;
                delete tree.key;
            }
            if(key == "values") {
                tree.children = [];
                for (item in tree.values) {
                    tree.children.push(reNameTree(tree.values[item], value_key, value_name));
                }
                delete tree.values;
            }
            if (key == value_key) {

                //console.log("D  " + tree[value_key].toString());
                if(tree[value_key] !== 0) {
                    //console.log("H  " + tree[value_key].toString());
                    tree.size = parseFloat(tree[value_key]);
                    //console.log("H  " + tree.value);
                    tree.name = tree[value_name];

                    delete tree[value_key];
                    delete tree[value_name];
                }
            }
        }
        return tree;
    }

    function zoom(d) {
 
        console.log("In Zoom Function")
        //console.log()
        treemap.sticky(true);
        //treemapZoom.sticky(false);

        this.treemapZoom
            //.skicky(true)
            .padding([headerHeight/(chartHeight/d.dy), 0, 0, 0])
            .nodes(d);

        var kx = chartWidth  / d.dx;
        var ky = chartHeight / d.dy;
        var level = d;

        xscale.domain([d.x, d.x + d.dx]);
        yscale.domain([d.y, d.y + d.dy]);

        if (node != level) {
            if (!checkClick) {
                checkClick = 1;
                chart.selectAll(".cell.child .foreignObject")
                    .style("display", "none");
            } else {
                checkClick = 0;
                chart.selectAll(".cell.child .foreignObject .labelbody .label")
                    .style("display", "none");
            }
        }

        var zoomTransition = chart.selectAll("g.cell").transition().duration(transitionDuration)
            .attr("transform", function(d) { return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")"; })
            .each("end", function(d, i) {
                if (!i && (level !== self.root)) {
                    chart.selectAll(".cell.child")
                        .filter(function(d) { return d.parent === self.node; }) 
                        .select(".foreignObject .labelbody .label")
                        .style("color", "white"); 

                    if (checkClick) {
                        chart.selectAll(".cell.child")
                            .filter(function(d) { return d.parent === self.node; })
                            .select(".foreignObject")
                            .style("display", "");
                        checkClick = 0;
                    } else {
                        chart.selectAll(".cell.child")
                            .filter(function(d) { return d.parent === self.node; })
                            .select(".foreignObject .labelbody .label")
                            .style("display", "");
                        checkClick = 1; 

                    }
                }
            });

        zoomTransition.select(".foreignObject")
            .attr("width", function(d) { return Math.max(0.01, kx * d.dx); })
            .attr("height", function(d) { return d.children ? headerHeight: Math.max(0.01, ky * d.dy); })
            .select(".labelbody .label")
            .text(function(d) { return d.name; });

        zoomTransition.select("rect")
            .attr("width", function(d) { return Math.max(0.01, kx * d.dx); })
            .attr("height", function(d) { return d.children ? headerHeight : Math.max(0.01, ky * d.dy); })
            .style("fill", function(d) { return d.children ? headerColor : color(d.parent.name); });

        node = d;

    }