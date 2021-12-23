// set the dimensions and margins of the graph
var margin = { top: 30, right: 0, bottom: 30, left: 30 },
  width = 200 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

//Read the dab
// d3.csv('education.csv', dataPreprocessor).then(function(dab) {
d3.csv('education.csv', function (dab) {

  // dab = map.remove("National");

  let features = ["school_lunches_percent_students_free_lunch", "school_lunches_percent_students_free_lunch", "school_lunches_percent_students_free_lunch", "school_lunches_percent_students_free_lunch", "school_lunches_percent_students_free_lunch"];
  console.log(dab);

  // functions --------------------------------------------------------------------------------------------
  function scaleFeatures() {
    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      // console.log(ft_name);

      let temp = dab.map(d => parseFloat(d[ft_name]));
      // console.log(temp);

      let ext = d3.extent(temp);
      // console.log(ext);

      let scl = d3.scaleLinear()
        .domain(ext)
        .range([0, 10]);

      let juice = temp.map(d => scl(d));
      // console.log(juice);

      for (var j = 0; j < dab.length; j++) {
        dab[j][ft_name] = juice[j];
      }
    }
  }

  // calculates path coordinates
  function getPathCoordinates(data_point) {

    // console.log(data_point);
    let coordinates = [];
    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);


      // console.log(ft_name);
      // console.log(data_point[ft_name]);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
      // coordinates.push(angleToCoordinate(angle, dabScale(data_point[ft_name])));
    }

    // console.log(coordinates);
    return coordinates;
  }

  // calculates coordinate based on angle
  function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radarSizeScale(value);
    let y = Math.sin(angle) * radarSizeScale(value);
    return { "x": 100 + x, "y": 100 - y };
  }

  function draw() {
    d3.selectAll("#graphie").remove();

    //draw the path element
    svg.append("path")
      .datum((d, i) => getPathCoordinates(nested[i].values[0]))
      .attr("d", line)
      .attr("stroke-width", 3)
      .attr("stroke", colors[0])
      .attr("fill", colors[0])
      .attr("stroke-opacity", 1)
      .attr("opacity", 0.5)
      .attr("id", "graphie")
      .transition()
      .duration(1000);

    // draw all axis lines
    for (var i = 0; i < features.length; i++) {
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      let line_coordinate = angleToCoordinate(angle, 10);
      let label_coordinate = angleToCoordinate(angle, 10.5);

      svg.append("line")
        .attr("x1", 100)
        .attr("y1", 100)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("stroke", "grey")
        .attr("id", "graphie")
        .style("stroke-dasharray", ("10,3"));
    }
  }

  //returns english titles
  function getNameToShow(key) {
    switch (key) {
      case "school_lunches_percent_students_free_lunch": return ("Free Lunch")
      case "perpupil_spending": return ("Per Pupil Spending")
      case "adjusted_perpupil_spending": return ("Adjusted Per Pupil Spending")
      case "educational_attainment_bachelor_plus": return ("College Grad")
      case "educational_attainment_hs_plus": return ("Highschool Grad")
      case "per_pupil_salaries": return ("Per Pupil Salaries")
      case "avg_act_composite_score": return ("ACT Scores")
      case "average_sat_scores": return ("SAT Scores")
    }
  }

  //setup ----------------------------------------------------------------------------------------------
  var nested = d3.nest() // maybe not neccesary 
    .key(function (d) { return d.State; })
    .entries(dab);

  allKeys = nested.map(function (d) { return d.key })

  // Add an svg element for each group. They will be side by side and will go next row when no more room available
  var svg = d3.select("#my_dataviz")
    .selectAll("uniqueChart")
    .data(nested)
    .enter()
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // sets up scale for the radars
  let radarSizeScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 6]);

  // draw all state titles
  svg
    .append("text")
    .attr("text-anchor", "start")
    .attr("y", 25)
    .attr("x", 10)
    .text(function (d) { return (d.key) })

  // whats this
  let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

  let colors = ["darkorange", "gray", "navy"];

  //init ----------------------------------------------------------
  scaleFeatures();
  draw();

  // ---------------------------------------------- legend
  // select the svg area
  var svggez = d3.select("#my_legend")
    .append("svg")
    .attr("width", 7 * (width + margin.left + margin.right))
    .attr("height", 3 * height)
    .append("g")
    .attr("transform", "translate(" + 2.5 * (width + margin.left) + "," + 5 * margin.top + ")");

  // title
  svggez.append("text").attr("class", "big-title-font").attr("text-anchor", "start").attr("y", -80).attr("x", -400).text("Small Multiples Radar Chart")
  // name
  svggez.append("text").attr("class", "small-title-font").attr("text-anchor", "start").attr("y", -40).attr("x", -400).text("Funding & Education by State")

  // legend
  svggez.append("text").attr("class", "small-title-font").attr("text-anchor", "start").attr("y", -40).attr("x", 450).text("Legend")

  // draws legend labels
  function drawLegend() {
    d3.selectAll("#legends").remove();
    for (var i = 0; i < features.length; i++) {
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      let line_coordinate = angleToCoordinate(angle, 10);
      let label_coordinate = angleToCoordinate(angle, 20);

      //draw axis line
      svggez.append("line")
        .attr("x1", 100)
        .attr("y1", 100)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("transform", "translate(" + 390 + "," + 0 + ")")
        .attr("stroke", "grey")
        .attr("id", "legends")
        .style("stroke-dasharray", ("10,3"));

      //draw axis label
      svggez.append("text")
        .attr("x", 1.3 * (label_coordinate.x) + 362)
        .attr("y", 0.7 * (label_coordinate.y) + 35)
        .attr("class", "legend-label-font")
        .attr("text-anchor", "middle")
        .attr("id", "legends")
        .text(getNameToShow(features[i]));
    }
  }

  drawLegend();

  //----------------------------------------------------------------- dropdown

  // List of groups (here I have one group per column)
  var allGroup = ["school_lunches_percent_students_free_lunch", "perpupil_spending", "adjusted_perpupil_spending", "educational_attainment_bachelor_plus", "educational_attainment_hs_plus", "per_pupil_salaries", "avg_act_composite_score"];
  var count = 5;

  d3.select("#selectButton0").selectAll('myOptions').data(allGroup).enter().append('option')
  .text(function (d) { return getNameToShow(d); }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button
  d3.select("#selectButton1").selectAll('myOptions').data(allGroup).enter().append('option')
    .text(function (d) { return getNameToShow(d); }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
  d3.select("#selectButton2").selectAll('myOptions').data(allGroup).enter().append('option')
    .text(function (d) { return getNameToShow(d); }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
  d3.select("#selectButton3").selectAll('myOptions').data(allGroup).enter().append('option')
    .text(function (d) { return getNameToShow(d); }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
  d3.select("#selectButton4").selectAll('myOptions').data(allGroup).enter().append('option')
    .text(function (d) { return getNameToShow(d); }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
  d3.select("#selectButton5").selectAll('myOptions').data(allGroup).enter().append('option')
    .text(function (d) { return getNameToShow(d); }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

  function yehaw() {
    // add the options to the button
    d3.select("#selectButton0").style("visibility", function () { return (count >= 1 ? "visible" : "hidden") })
    d3.select("#selectButton1").style("visibility", function () { return (count >= 2 ? "visible" : "hidden") })
    d3.select("#selectButton2").style("visibility", function () { return (count >= 3 ? "visible" : "hidden") })
    d3.select("#selectButton3").style("visibility", function () { return (count >= 4 ? "visible" : "hidden") })
    d3.select("#selectButton4").style("visibility", function () { return (count >= 5 ? "visible" : "hidden") })
    d3.select("#selectButton5").style("visibility", function () { return (count >= 6 ? "visible" : "hidden") })
  }

  yehaw();


  // When the button is changed, run the updateChart function
  d3.select("#selectButton0").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 0)
  })
  d3.select("#selectButton1").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 1)
  })
  d3.select("#selectButton2").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 2)
  })
  d3.select("#selectButton3").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 3)
  })
  d3.select("#selectButton4").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 4)
  })
  d3.select("#selectButton5").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption, 5)
  })


  // A function that update the chart
  function update(selectedGroup, key) {

    if (selectedGroup == "monk") {
      features.pop();
      console.log("yes")
    } else {
      features[key] = selectedGroup;
    }


    scaleFeatures();

    draw()

    drawLegend();
  }

  function monkA() {
    if (count < 6) {
      update("school_lunches_percent_students_free_lunch", count)
      count++;
      yehaw();
    }
    console.log("juice :" + count);
  }
  function monkB() {
    if (count > 3) {
      update("monk", count)
      count--;
      yehaw();
    }
    console.log("nojuice :" + count);
  }

  document.getElementById("addBob").addEventListener("click", monkA);
  document.getElementById("removeBob").addEventListener("click", monkB);

})