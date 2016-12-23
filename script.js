var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//var xValue = function(d) { return d.middleGrade;}, // data -> value
    //xScale = d3.scale.linear().range([0, width]), // value -> display
var xValue = function(d) { return d.date;}, // data -> value
    xScale = d3.time.scale().range([0, width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function(d) { return d.middleGrade;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

//var oValue = function(d) { return d.date;}, // data -> value
    //oScale = d3.scale.linear().range([0, 1]); // value -> display

//var sValue = function(d) { return d.date;}, // data -> value
    //sScale = d3.scale.linear().range([0, 4]); // value -> display

//setup fill color
var cValue = function(d) { return d.agentId;},
    cScale = d3.scale.category20();

var dateFormat = d3.time.format("%Y-%m-%d").parse;

var line = d3.svg.line()
    .x(function(d) { return xScale(xValue(d)); })
    .y(function(d) { return yScale(yValue(d)); });

 //add the graph canvas to the body of the webpage
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 //load data
d3.json("/data-banki.ru/ratings-top50.json", function(errorData, data) {
  d3.json("/data-banki.ru/names-required.json", function(errorNames, dataNames) {
    //var bankIDs = dataNames.map(function(d){return d.id;});
    //console.log(bankIDs);
    //var bankIDs = [189984, 196721, 5919];
    //data = data.filter(function(d){return bankIDs.includes(d.agentId);});
    //document.write(JSON.stringify(data));
    data.forEach(function(d) {
      d.date = dateFormat(d.date);
    });
    data = data.sort(function(a, b){return a.date-b.date;});
    var dataNested = d3.nest()
      .key(function(d) { return d.agentId; })
      .entries(data);
    console.log(dataNested);

    xScale.domain(d3.extent(data, xValue));
    //yScale.domain(d3.extent(data, yValue));
    yScale.domain([1,5]);
    cScale.domain(d3.extent(data, function(d) { return d.agentId; }));
    //oScale.domain(d3.extent(data, oValue));
    //sScale.domain(d3.extent(data, sValue));

     //x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(xValue.toString());

     //y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yValue.toString());

    var group = svg.selectAll("g")
        .data(dataNested)
        .enter()
        .append("g")
        .attr("opacity", 0.3)
        .on('mouseover', function(d){

          console.log(dataNames.filter(function(n){return n.id.toString() == d.key;})[0]);
          var nodeSelection = d3.select(this).style({
            opacity: 1.0
          });
          nodeSelection.selectAll("circle")
            .style({
              fill: "black"
            });
        })
        .on('mouseout', function(d){
          var nodeSelection = d3.select(this).style({
            opacity: 0.3
          });
          nodeSelection.selectAll("circle")
            .style({
              fill: null
            });
        });

    var circles = group.selectAll("circle")
        .data(function(d){return d.values;})
        .enter()
        .append("circle")
        .attr("cx", function(d){return xScale(xValue(d));})
        .attr("cy", function(d){return yScale(yValue(d));})
        //.attr("r", function(d){return sScale(sValue(d));})
        .attr("r", 1)
        .attr("fill", function(d){return cScale(cValue(d));});

    //// draw lines
    //var lines = svg.selectAll("path")
      //.data(dataNested)
      //.enter()
      //.append("path")
      //.attr("d", function(d){return line(d.values);})
      //.attr("stroke", function(d){return cScale(cValue(d.values[0]));})
      //.attr("stroke-width", 0.3)
      //.attr("fill", "none")
      //.on('mouseover', function(d){
        //var nodeSelection = d3.select(this).style({
          //stroke:'black',
          //"stroke-width": 1
        //});
      //})
      //.on('mouseout', function(d){
        //d3.select(this).style({
          //stroke: cScale(cValue(d)),
          //"stroke-width": null
        //})
      //});

    //// draw legend
    //var legend = svg.selectAll(".legend")
        //.data(color.domain())
      //.enter().append("g")
        //.attr("class", "legend")
        //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    //// draw legend colored rectangles
    //legend.append("rect")
        //.attr("x", width - 18)
        //.attr("width", 18)
        //.attr("height", 18)
        //.style("fill", color);

    //// draw legend text
    //legend.append("text")
        //.attr("x", width - 24)
        //.attr("y", 9)
        //.attr("dy", ".35em")
        //.style("text-anchor", "end")
        //.text(function(d) { return d;})
  });
});
