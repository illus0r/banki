var svgMainMargin = {top: 10, right: 20, bottom: 30, left: 40},
    svgMainSize = { 
      width:  754 - svgMainMargin.left - svgMainMargin.right,
      height: 630 - svgMainMargin.top - svgMainMargin.bottom
    };

//var xValue = function(d) { return d.middleGrade;}, // data -> value
    //xScale = d3.scale.linear().range([0, svgMainSize.width]), // value -> display
var xValue = function(d) { return d.date;}, // data -> value
    xScale = d3.time.scale().range([0, svgMainSize.width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");
//var yValue = function(d) { return d.middleGrade;}, // data -> value
var yValue = function(d) { return d.rating;}, // data -> value
    yScale = d3.scale.linear().range([svgMainSize.height-20, 0]), // value -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
var xValue = function(d) { return d.date;}, // data -> value
    xScale = d3.time.scale().range([0, svgMainSize.width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yValueResponses = function(d) { var inc = d.responseCountIncrease; return inc>0?inc:0;}, // data -> value
    yScaleResponses = d3.scale.linear().range([1, 50]); // value -> display
    yAxisResponses = d3.svg.axis().scale(yScaleResponses).orient("left").ticks(1);

//var oValue = function(d) { return d.date;}, // data -> value
    //oScale = d3.scale.linear().range([0, 1]); // value -> display
//var sValue = function(d) { return d.date;}, // data -> value
    //sScale = d3.scale.linear().range([0, 4]); // value -> display

//setup fill color
var cValue = function(d) { return d.agentId;},
    cScale = d3.scale.category10();
var dateFormat = d3.time.format("%Y-%m-%d").parse;
var line = d3.svg.line()
    .x(function(d) { return xScale(xValue(d)); })
    .y(function(d) { return yScale(yValue(d)); });
var lineResponses = d3.svg.line()
    .x(function(d) { return xScale(xValue(d)); })
    .y(function(d) { return yScaleResponses(yValueResponses(d)); });

 //add the graph canvas to the body of the webpage
  var svgMain = d3.select("#main").append("svg")
      .attr("class", "main")
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

      //
      // Praparing data
      //
      data.forEach(function(d) {
        d.date = dateFormat(d.date);
      });
      var maxDate = d3.max(data, function(d){return d.date;})
      console.log(maxDate);
      data = data.sort(function(a, b){return a.date-b.date;});
      var dataNested = d3.nest()
        .key(function(d) { return d.agentId; })
        .entries(data);
      dataNested.forEach(function(d) {
        var responseCountPrevious = 0;
        d.values.forEach(function(n) {
          n.responseCountIncrease = n.responseCount - responseCountPrevious;
          responseCountPrevious = n.responseCount;
        });
        var matchingNames = dataNames.filter(function(n){
          return (n.id.toString() === d.key);
        });
        if(matchingNames){
          d.title = matchingNames[0].title;
        }
        d.isLive = d.values[d.values.length-1].date >= maxDate ? true : false;
        d.rating = d.values[d.values.length-1].rating;
        d.middleGrade = d.values[d.values.length-1].middleGrade;
        d.deposits = d.values[d.values.length-1].middleGrade; // TODO fix these 3 lines
        d.credits = d.values[d.values.length-1].middleGrade;
        d.debitcards = d.values[d.values.length-1].middleGrade;
      });
      // sorting by rating, but live first
      dataNested = dataNested.sort( function(a, b){
          return (b.rating + 9999*b.isLive) - (a.rating + 9999*a.isLive) ;
        }
      //dataNested = dataNested.sort( function(a, b){
          //return (b.middleGrade + 9999*b.isLive) - (a.middleGrade + 9999*a.isLive) ;
        //}
      );


      // Preparing dataProducts
      dataProducts = dataProducts.map(function(d){return {
          title: d.title,
          date: d.date,
          middleGrade: parseFloat(d.middleGrade),
          debitcards: parseFloat(d.debitcards),
          deposits: parseFloat(d.deposits),
          credits: parseFloat(d.credits)
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
            d.id = matchingNames[0].id;
          }
        }
      });
      dataProductsNested = dataProductsNested.filter(function(d) {return d.id});

      //xScale.domain(d3.extent(data, xValue));
      xScale.domain([dateFormat("2004-12-31"), dateFormat("2017-01-01")]);
      yScale.domain(d3.extent(data, yValue));
      //yScale.domain([1,5]);
      yScaleResponses.domain([0,200]);
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
          .style("text-anchor", "end");

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
          .text("Средняя оценка");

       //y-axis
      //svgMain.append("g")
          //.attr("class", "axis-responses")
          //.call(yAxisResponses)
          //.attr("transform", "translate("+svgMainSize.width+")")
          //.append("text")
          //.attr("class", "label")
          //.attr("transform", "rotate(-90)")
          //.attr("y", 6)
          //.attr("dy", ".71em")
          //.style("text-anchor", "end")
          //.text("Отзывы");

      d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
        this.parentNode.appendChild(this);
        });
      };

      var group = svgMain.selectAll("g.main-group")
          .data(dataNested)
          .enter()
          .append("g")
          .classed("main-group", true)
          .classed("dead", function(d){return !d.isLive;})
          .attr("id", function(d) { return "group"+d.key; })
          .attr("fill",   function(d){return cScale(cValue(d.values[0]))})
          .attr("stroke", function(d){return cScale(cValue(d.values[0]))})
          .on('mouseover', function(d){
            var nodeSelection = d3.select(this);
            nodeSelection.classed("hover", true);
            var id = "#thumbnail-"+d.key;
            var $id = $(id).addClass("hover");
            nodeSelection.moveToFront();
          })
          .on('click', function(d){
            console.log(dataNames.filter(function(n){return n.id.toString() === d.key;})[0]);
            showBank(d.key);
          })
          .on('mouseout', function(d){
            var nodeSelection = d3.select(this).classed("hover", false);
            var id = "#thumbnail-"+d.key;
            var $id = $(id).removeClass("hover");
          });

      var pointConnector = group.selectAll("path.connector")
        .data(function(d){return [d];})
        .enter()
        .append("path")
        .attr("class", "connector")
        //.attr("opacity", "0.9")
        .attr("d", function(d){return line(d.values);})
        .attr("fill", "none");
      
      var pointWidth = xScale(dateFormat("2000-01-07")) - xScale(dateFormat("2000-01-01")) + 0.5;
      var responses = group
          .append("g")
          .attr("display", "none")
          .attr("class", "responses")
          .selectAll("rect")
          .data(function(d){return d.values;})
          .enter()
          .append("rect")
          .attr("x", function(d){return xScale(xValue(d)) - pointWidth/2;})
          .attr("y", function(d){return yScale(yValue(d)) - yScaleResponses(yValueResponses(d))/2;})
          .attr("width", pointWidth)
          .attr("height", function(d){return yScaleResponses(yValueResponses(d));});

      var pointHeight = 2;
      var points = group
          .append("g")
          .attr("display", "none")
          .attr("class", "points")
          .selectAll("rect")
          .data(function(d){return d.values;})
          .enter()
          .append("rect")
          .attr("x", function(d){return xScale(xValue(d)) - pointWidth/2;})
          .attr("y", function(d){return yScale(yValue(d)) - pointHeight/2;})
          .attr("width", pointWidth)
          .attr("height", pointHeight);

      //var responsesPaths = group.selectAll("path.response")
        //.data(function(d){return [d];})
        //.enter()
        //.append("path")
        //.attr("class", "response")
        //.attr("d", function(d){return lineResponses(d.values);})
        //.attr("stroke-width", 0.1)
        //.attr("stroke", "black")
        //.attr("fill", "none");
      

                                   //##          ##
                                     //##      ##
                                   //##############
                                 //####  ######  ####
                               //######################
                               //##  ##############  ##
                               //##  ##          ##  ##
                                     //####  ####

  var thumbnailSvgMargin = {top: 1, right: 0, bottom: 0, left: 0},
      thumbnailSvgSize = {
        width: 225 - thumbnailSvgMargin.left - thumbnailSvgMargin.right,
        height: 57 - thumbnailSvgMargin.top - thumbnailSvgMargin.bottom
      };

  var thumbnailXValue = function(d) { return d.date;}, // data -> value
      thumbnailXScale = d3.time.scale()
        .range([0, thumbnailSvgSize.width])
        .domain(d3.extent(data, xValue)), // value -> display
      thumbnailXAxis = d3.svg.axis().scale(thumbnailXScale).orient("bottom");
  var thumbnailYValue_ = function(d) { return d.deposits;}, // data -> value
      thumbnailYScale = d3.scale.linear()
        .range([thumbnailSvgSize.height, 0]) // value -> display
        .domain([1,5]),
      thumbnailYAxis = d3.svg.axis().scale(thumbnailYScale).orient("left");

  var thumbnailLineRating = d3.svg.line()
      .x(function(d) { return thumbnailXScale(thumbnailXValue(d)); })
      .y(function(d) { return thumbnailYScale(d.rating); });
  //var thumbnailLineMiddleGrade = d3.svg.line()
      //.x(function(d) { return thumbnailXScale(thumbnailXValue(d)); })
      //.y(function(d) { return thumbnailYScale(d.middleGrade); });
  var thumbnailLineDeposits = d3.svg.line()
      .x(function(d) { return thumbnailXScale(d.date); })
      .y(function(d) { return thumbnailYScale(d.deposits); })
      .interpolate("basis");
  var thumbnailLineDebitcards = d3.svg.line()
      .x(function(d) { return thumbnailXScale(d.date); })
      .y(function(d) { return thumbnailYScale(d.debitcards); })
      .interpolate("basis");
  var thumbnailLineCredits = d3.svg.line()
      .x(function(d) { return thumbnailXScale(d.date); })
      .y(function(d) { return thumbnailYScale(d.credits); })
      .interpolate("basis");

      // Addidng lots of small `svg`s and binding data to each of them.
      var thumbnailDiv = d3.select("#list").selectAll("div.thumbnail")
        .data(dataNested)
        .enter()
        .append("div")
        .attr("id", function(d){return "thumbnail-"+d.key;})
        .attr("data-id", function(d){return d.key;})
        .attr("class", function(d){return d.isLive? "live" : "dead";})
        .classed("thumbnail", true)
        .on('mouseover', function(d){
          var mainGraph = d3.select("#group"+d.key.toString());
          mainGraph.classed("hover", true);
          mainGraph.moveToFront();
        })
        .on('mouseout', function(d){
          var mainGraph = d3.select("#group"+d.key.toString()).classed("hover", false);
        });

      var thumbnailSvg = thumbnailDiv.append("svg")
        .attr("width", thumbnailSvgSize.width + thumbnailSvgMargin.left + thumbnailSvgMargin.right)
        .attr("height", thumbnailSvgSize.height + thumbnailSvgMargin.top + thumbnailSvgMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + thumbnailSvgMargin.left + "," + thumbnailSvgMargin.top + ")");

      var thumbnailGraphProducts = thumbnailSvg.selectAll("path.deposit")
        .data(function(d){
          var temp = [dataProductsNested.filter(function(n){
            return d.key === n.id.toString();
          })[0].values];
          return temp;
        })
        .enter();
      thumbnailGraphProducts
        .append("path")
        .attr("d", function(d){return thumbnailLineDeposits(d);})
        .attr("stroke", "#66C2A5")
        .attr("stroke-width", 1)
        .attr("fill", "none");
      thumbnailGraphProducts
        .append("path")
        .attr("d", function(d){return thumbnailLineCredits(d);})
        .attr("stroke", "#FEA075")
        .attr("stroke-width", 1)
        .attr("fill", "none");
      thumbnailGraphProducts
        .append("path")
        .attr("d", function(d){return thumbnailLineDebitcards(d);})
        .attr("stroke", "#FFDE3C")
        .attr("stroke-width", 1)
        .attr("fill", "none");
      var thumbnailGraph = thumbnailSvg
        .append("path")
        //.attr("d", function(d){return thumbnailLineMiddleGrade(d.values);})
        .attr("d", function(d){return thumbnailLineRating(d.values);})
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");

      var thumbnailHeader = thumbnailDiv.append("header");

      var thumbnailTitle = thumbnailHeader.append("h2")
        .style("color", function(d){return cScale(d.key);})
        .text( function(d){return d.title;});

      //var thumbnailTitle = thumbnailHeader.append("h2")
        //.text( function(d){return d.title;});
      //var img = new Image();
      //img.onerror = function() {alert("error")};
      //img.onabort = function() {alert("abort")};
      //img.onload = function() {alert("success")};
      //img.src = "404_not_found.png";


      var thumbnailGrades = thumbnailDiv.append("div")
        .attr("class", "grades");

      //var thumbnailGradesMiddleGrade = thumbnailGrades
      var thumbnailGradesRating = thumbnailGrades
        .append("div")
        .attr("class", "middle-grade");
      var thumbnailGradesRatingLabel = thumbnailGradesRating
        .append("span")
        .attr("class", "label")
        .text("средняя оценка");
      var thumbnailGradesRatingValue = thumbnailGradesRating
        .append("span")
        .attr("class", "value")
        .text( function(d){return d.rating.toFixed(1).replace(".", ",");});
      var thumbnailGradesProducts = thumbnailGrades
        .append("div")
        .attr("class", "grades-products");
      var thumbnailGradesProductsDeposits = thumbnailGradesProducts
        .append("span")
        .attr("class", "deposits")
        .text( function(d){return "по вкладам "+d.deposits.toFixed(1).replace(".", ",");});
      var thumbnailGradesProductsDebitcards = thumbnailGradesProducts
        .append("span")
        .attr("class", "debitcards")
        .text( function(d){return "деб. картам "+d.debitcards.toFixed(1).replace(".", ",");});
      var thumbnailGradesProductsCredits = thumbnailGradesProducts
        .append("span")
        .attr("class", "credits")
        .text( function(d){return "кредитам "+d.credits.toFixed(1).replace(".", ",");});

      $(window).on("load resize scroll",function(e){
        console.log("window");
        $("g.main-group").removeClass("within-viewport");
        thumbnailsInViewport = $('.thumbnail')
          .withinviewport({sides: "top bottom", top: -110, bottom: -100});
        thumbnailsInViewport.each( function(){
          $("svg #group"+$(this).data("id")).addClass("within-viewport");
        });
      });
      $('html, body').animate({
          scrollTop: 2
      }, 300);//, function(){

    });
  });
});



function showBank(key){
  var id = "#thumbnail-"+key;
  var $id = $(id)

  $('html, body').animate({
      scrollTop: $id.offset().top - 280
  }, 500);//, function(){
    //$id.addClass("shake");
    //setTimeout(function(){
      //$id.removeClass("shake");
    //},500);
  //});
}

//$('html, body').animate({
    //scrollTop: 2000
//}, 3000);//, function(){
