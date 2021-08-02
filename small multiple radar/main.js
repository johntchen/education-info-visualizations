// set the dimensions and margins of the graph
var margin = {top: 30, right: 0, bottom: 30, left: 30},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

//Read the dab
// d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv", function(dab) {
d3.csv('education.csv', function(dab) {

  let data = [{"% College": 4,
    "% HS": 4,
    "% Higher Ed": 7,
    "Funding": 2},
    {"% College": 1,
    "% HS": 1,
    "% Higher Ed": 8,
    "Funding": 5}];
  // let data = [];
  let features = ["% HS","% College", "% Higher Ed", "Funding"];
  // let features = ["act_percent_students_tested","act_percent_students_tested", "act_percent_students_tested", "act_percent_students_tested"];
  //generate the dummy data
  // for(var j = 0; j < 2; j++) {
    // for (var i = 0; i < 1; i++){
    //     var point = {}
    //     //each feature will be a random number from 1-9
    //     features.forEach(f => point[f] = 1 + Math.random() * 8);
    //     data.push(point);
    // }
  // }
  console.log(data);
  console.log(dab);
  // console.log(dab.act_percent_students_tested);
  // for (i = 0; i < dab.length; i++) {
  //   console.log(i);
  //   console.log(data[i].act_percent_students_tested);
  // }
  // var val = dab.map(x => Object.values(x));
  // console.log(val[0][0]);

  // console.log(function(d) {
  //   return {date: d.date, temperature: +d[name]}
  // });

  // var allGroup = d3.map(data, function(d){return(d.State)}).keys()
  // console.log(allGroup);

  // console.log(dab.columns);
  
  // group the dab: I want to draw one line per group
  var nested = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.State;})
    .entries(dab);

    // console.log(fuction(d) {return d.State;});

  // What is the list of groups?
  allKeys = nested.map(function(d){return d.key})

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
    //   .text(function (d, i) {
    //     console.log(d.values[0]["act_percent_students_tested"]/10); // the data element
    //     // console.log(i); // the index element
    //     // console.log(this); // the current DOM object
    //     // return d.key;
    // });

  // calculates radial stuff? or just a normie scale
  let radialScale = d3.scaleLinear()
  .domain([0,10])
  .range([0,50]);

  // where are the rings
  let ticks = [5, 10];

  // draws rings
  ticks.forEach(t =>
  svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 100)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("r", radialScale(t))
  );

  // // have no use for now
  // ticks.forEach(t =>
  // svg.append("text")
  // .attr("x", 305)
  // .attr("y", 300 - radialScale(t))
  // .text(t.toString())
  // );

  // calculates coordinate based on angle
  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": 100 + x, "y": 100 - y};
  }

  for (var i = 0; i < features.length; i++) {
    // let ft_name = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 10);
    // let label_coordinate = angleToCoordinate(angle, 10.5);

    //draw axis line
    svg.append("line")
    .attr("x1", 100)
    .attr("y1", 100)
    .attr("x2", line_coordinate.x)
    .attr("y2", line_coordinate.y)
    .attr("stroke","black");

    //draw axis label
    // svg.append("text")
    // .attr("x", label_coordinate.x)
    // .attr("y", label_coordinate.y)
    // .text(ft_name);
  }

  // some setup for special line ?
  let line = d3.line()
  .x(d => d.x)
  .y(d => d.y);

  let colors = ["darkorange", "gray", "navy"];

  // calculates path coordinates
  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }

  // iterate through the data and draw the vis
  // for (var i = 0; i < data.length; i++){
  //   let d = data[i];
    console.log(dab[0]);

    //draw the path element
    svg.append("path")
    // .text(function (d, i) {
    //   console.log(d.values[0]["act_percent_students_tested"]/10); // the data element
      // console.log(i); // the index element
      // console.log(this); // the current DOM object
      // return d.key;
    // })
    .datum(getPathCoordinates(data[0]))
    // .datum(getPathCoordinates(function(d) {
    //   console.log(d.values); // the data element
    //   return (data[0]);
    // }))
    // .datum(getPathCoordinates(function(d) {
    //   return (d[0]);
    // })
    .attr("d", line)
    .attr("stroke-width", 3)
    .attr("stroke", colors[0])
    .attr("fill", colors[0])
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);
  // }

  // Add titles
  svg
  .append("text")
  .attr("text-anchor", "start")
  .attr("y", 25)
  .attr("x", 10)
  .text(function(d){ return(d.key)})
  // .style("fill", function(d){ return color(d.key) })

})