var svgMainMargin = {top: 20, right: 20, bottom: 30, left: 40},
    svgMainSize = { 
      width:  900 - svgMainMargin.left - svgMainMargin.right,
      height: 235 - svgMainMargin.top - svgMainMargin.bottom
    };

//var xValue = function(d) { return d.middleGrade;}, // data -> value
    //xScale = d3.scale.linear().range([0, svgMainSize.width]), // value -> display
var xValue = function(d) { return d.date;}, // data -> value
    xScale = d3.time.scale().range([0, svgMainSize.width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function(d) { return d.middleGrade;}, // data -> value
    yScale = d3.scale.linear().range([svgMainSize.height, 0]), // value -> display
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
  var svgMain = d3.select("body").append("svg")
      .attr("width", svgMainSize.width + svgMainMargin.left + svgMainMargin.right)
      .attr("height", svgMainSize.height + svgMainMargin.top + svgMainMargin.bottom)
      .style("display", "block")
      .append("g")
      .attr("transform", "translate(" + svgMainMargin.left + "," + svgMainMargin.top + ")");

 //load data
d3.json("/data-banki.ru/ratings-required.json", function(errorData, data) {
  d3.json("/data-banki.ru/names-required.json", function(errorNames, dataNames) {
    d3.json("/data-banki.ru/products-required.json", function(errorProducts, dataProducts) {
      //var bankIDs = dataNames.map(function(d){return d.id;});
      //console.log(bankIDs);
      //var bankIDs = [189984, 196721, 5919];
      //data = data.filter(function(d){return bankIDs.includes(d.agentId);});
      //document.write(JSON.stringify(data));

      // Praparing data
      data.forEach(function(d) {
        d.date = dateFormat(d.date);
      });
      data = data.sort(function(a, b){return a.date-b.date;});
      var dataNested = d3.nest()
        .key(function(d) { return d.agentId; })
        .entries(data);

      // Preparing dataProducts
      dataProducts = dataProducts.map(function(d){return {
          title: d.title,
          date: d.date,
          middleGrade: parseFloat(d.middleGrade),
          debitcards: parseFloat(d.debitcards),
          deposits: parseFloat(d.deposits)
        };
      });
      dataProducts.forEach(function(d) {
        d.date = dateFormat(d.date);
      });
      dataProducts = dataProducts.sort(function(a, b){return a.date-b.date;});
      var dataProductsNested = d3.nest()
        .key(function(d) { return d.title; })
        .entries(dataProducts);
      dataProductsNested.forEach(function(d) {
        var matchingNames = dataNames.filter(function(n){
          if(n.title === d.key){
            return true;
          }
          return false;
          //return n.title === d.key;
          //return "asdf";
        });
        if (matchingNames.length > 0){
          if (matchingNames[0].hasOwnProperty('id')){
            console.log(".");
            d.id = matchingNames[0].id;
          }
        }
      });
      dataProductsNested = dataProductsNested.filter(function(d) {return d.id});

      xScale.domain(d3.extent(data, xValue));
      //yScale.domain(d3.extent(data, yValue));
      yScale.domain([1,5]);
      cScale.domain(d3.extent(data, function(d) { return d.agentId; }));
      //oScale.domain(d3.extent(data, oValue));
      //sScale.domain(d3.extent(data, sValue));

       //x-axis
      svgMain.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + svgMainSize.height + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", svgMainSize.width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text(xValue.toString());

       //y-axis
      svgMain.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yValue.toString());

      var group = svgMain.selectAll("g")
          .data(dataNested)
          .enter()
          .append("g")
          .style("opacity", 0.3)
          .on('mouseover', function(d){
            console.log(dataNames.filter(function(n){return n.id.toString() === d.key;})[0]);
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

      //var paths = svgMain.selectAll("path")
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


                                   //##          ##
                                     //##      ##
                                   //##############
                                 //####  ######  ####
                               //######################
                               //##  ##############  ##
                               //##  ##          ##  ##
                                     //####  ####
  var thumbnailSvgMargin = {top: 0, right: 0, bottom: 0, left: 0},
      thumbnailSvgSize = {
        width: 200 - thumbnailSvgMargin.left - thumbnailSvgMargin.right,
        height: 50 - thumbnailSvgMargin.top - thumbnailSvgMargin.bottom
      };

  var thumbnailXValue = function(d) { return d.date;}, // data -> value
      thumbnailXScale = d3.time.scale()
        .range([0, thumbnailSvgSize.width])
        .domain(d3.extent(data, xValue)), // value -> display
      thumbnailXAxis = d3.svg.axis().scale(thumbnailXScale).orient("bottom");

  var thumbnailYValue_ = function(d) { return d.deposites;}, // data -> value
      thumbnailYScale = d3.scale.linear()
        .range([thumbnailSvgSize.height, 0]) // value -> display
        .domain([1,5]),
      thumbnailYAxis = d3.svg.axis().scale(thumbnailYScale).orient("left");

  //var thumbnailLine = d3.svg.line()
      //.x(function(d) { return thumbnailXScale(thumbnailXValue(d)); });

  var thumbnailLineMiddleGrade = d3.svg.line()
      .x(function(d) { return thumbnailXScale(thumbnailXValue(d)); })
      .y(function(d) { return thumbnailYScale(d.middleGrade); });

  var thumbnailLineDeposites = d3.svg.line()
      .x(function(d) { return thumbnailXScale(thumbnailXValue(d)); })
      .y(function(d) { return thumbnailYScale(d.deposites); });

      // Addidng lots of small `svg`s and binding data to each of them.
      var thumbnailDiv = d3.select("body").selectAll("div.thumbnail")
        .data(dataNested)
        .enter()
        .append("div")
        .attr("class","thumbnail")
        .style({
          "border": "1px solid silver",
          "display": "inline-block"
        });

      var thumbnailSvg = thumbnailDiv.append("svg")
        .attr("width", thumbnailSvgSize.width + thumbnailSvgMargin.left + thumbnailSvgMargin.right)
        .attr("height", thumbnailSvgSize.height + thumbnailSvgMargin.top + thumbnailSvgMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + thumbnailSvgMargin.left + "," + thumbnailSvgMargin.top + ")");

      //var thumbnailGraph = thumbnailSvg.selectAll("path")
        //.data( function(d){
          //console.log();
          //return dataNested.filter( function(n){
            //return n.key === d.id.toString();
          //})[0].values;
        //})
        //.enter()
        
      var thumbnailGraph = thumbnailSvg
        .append("path")
        .attr("d", function(d){return thumbnailLineMiddleGrade(d.values);})
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

      var thumbnailGraphProducts = thumbnailSvg.selectAll("path.deposite")
        .data(function(d){
          console.log(d);
          var temp = dataProductsNested.filter(function(n){
            return d.key === n.id.toString();
          })[0].values;
          console.log(temp);
          return temp;
        })
        .enter()
        //.call( function(d){
          //console.log(d);
        //});
        .append("path")
        .attr("d", function(d){return thumbnailLineDeposites(d);})
        .attr("stroke", "green")
        .attr("stroke-width", 0.5)
        .attr("fill", "none");
    });
  });
});
