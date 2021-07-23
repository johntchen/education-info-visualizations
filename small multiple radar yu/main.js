// set the dimensions and margins of the graph
var margin = {top: 30, right: 0, bottom: 30, left: 30},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

//Read the dab
d3.csv('education.csv', function(dab) {

  let features = ["educational_attainment_hs_plus","educational_attainment_bachelor_plus", "educational_attainment_advanced_degree_plus"];
  console.log(dab);

  var nested = d3.nest() // maybe not neccesary 
    .key(function(d) { return d.State;})
    .entries(dab);

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

  // calculates radial stuff? or just a normie scale
  let radialScale = d3.scaleLinear()
  .domain([0,10])
  .range([0,50]);

  let ticks = [5, 10];  // rings at 50 % & 10 %

  // draws rings
  ticks.forEach(t =>
  svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 100)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("r", radialScale(t))
  );

  // calculates coordinate based on angle
  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": 100 + x, "y": 100 - y};
  }

  for (var i = 0; i < features.length; i++) {
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 10);

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

    // console.log(data_point);
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);


        // console.log(ft_name);
        console.log(data_point[ft_name]);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]/10));
    }

    // console.log(coordinates);
    return coordinates;
  }

  // iterate through the data and draw the vis
    // console.log(dab[0]);

    //draw the path element

    // console.log(nested[0]);
    svg.append("path")
    .datum((d,i) => getPathCoordinates(nested[i].values[0]))
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