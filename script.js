var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// setup x 
//var xValue = function(d) { return d.values[0].checkedResponseCount;}, // data -> value
var xValue = function(d) { return d.date;}, // data -> value
    xScale = d3.time.scale().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

 //setup y
//var yValue = function(d) { return d.values[0].rating;},  data -> value
var yValue = function(d) { return d.middleGrade;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

var dateFormat = d3.time.format("%Y-%m-%d").parse;

//var line = d3.svg.line()
//
    //.x(function(d) { return [0,10,200,300,40]; })
    //.y(function(d) { return [0,500,12,55,564]; });


 //setup fill color
var cValue = function(d) { return d.agentId;},
    cScale = d3.scale.category20();

 //add the graph canvas to the body of the webpage
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 //load data
d3.json("banki.json", function(error, data) {

  data.forEach(function(d) {
    d.date = dateFormat(d.date);
  });
  data = data.sort(function(a, b){return a.date-b.date;});
  var dataNested = d3.nest()
    .key(function(d) { return d.agentId; })
    .entries(data);

  xScale.domain(d3.extent(data, function(d) { return d.date; }));
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
  cScale.domain(d3.extent(data, function(d) { return d.agentId; }));

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
      .text("time");

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
      .text("rating");

  var line = d3.svg.line()
      .x(function(d) { return xScale(xValue(d)); })
      .y(function(d) { return yScale(yValue(d)); });

  // draw lines
  //svg.selectAll("path")
      //.data(dataNested)
      //.enter()
      //.append("path")
      //.attr("d", function(d){return line(d.values);})
      //.attr("stroke", function(d){return cScale(cValue(d));})
      //.attr("stroke-width", 1)
      //.attr("fill", "none")
      //.on('mouseover', function(d){
        //var nodeSelection = d3.select(this).style({
          //stroke:'black',
          //"stroke-width": 2
        //});
      //})
      //.on('mouseout', function(d){
        //d3.select(this).style({
          //stroke: cScale(cValue(d)),
          //"stroke-width": 1
        //})
      //});
  group = svg.selectAll("g")
      .data(dataNested)
      .enter()
      .append("g")
      .attr("opacity", 0.5)
      .on('mouseover', function(d){
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
          opacity: 0.5
        });
        nodeSelection.selectAll("circle")
          .style({
            fill: null
          });
      });

  path = group.selectAll("circle")
      .data(function(d){return d.values;})
      .enter()
      .append("circle")
      .attr("r", 1)
      .attr("cx", function(d){return xScale(xValue(d));})
      .attr("cy", function(d){return yScale(yValue(d));})
      .attr("fill", function(d){return cScale(cValue(d));});
  //var bank = svg.selectAll("g")
      //.data(dataNested)
      //.enter()
      //.append("g")
      //.attr("class", "bank");

  //var circle = bank.selectAll("circle")
      //.data(function(d){return d.values;})
      //.enter()
      //.append("circle")
      //.attr("r", 1)
      //.attr("cx", function(d){ return xScale(xValue(d)); })
      //.attr("cy", function(d){ return yScale(yValue(d)); });

     //##          ##
       //##      ##
     //##############
   //####  ######  ####
  //######################
  //##  ##############  ##
  //##  ##          ##  ##
       //####  ####

  //console.log(dataNested[0].values.map(function(d){return [d.products.credits, d.products.businesscredits];}));
  //TODO А остановился я на том, что всё работает правильно. Линия действительно рисуется, но, похоже, данные такие, что она вырождается в точку.

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
