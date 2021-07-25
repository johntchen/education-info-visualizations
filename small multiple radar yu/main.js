// set the dimensions and margins of the graph
var margin = {top: 30, right: 0, bottom: 30, left: 30},
    width = 200 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

//Read the dab
d3.csv('education.csv', function(dab) {

  let features = ["adjusted_perpupil_spending","school_lunches_percent_students_free_lunch", "educational_attainment_advanced_degree_plus", "avg_act_composite_score"];
  console.log(dab);

  for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    console.log(ft_name);

    let temp = dab.map(d=> parseFloat(d[ft_name]));
    console.log(temp);

    let ext = d3.extent(temp);
    console.log(ext);

    let scl = d3.scaleLinear()
    .domain(ext)
    .range([0, 10]);

    let juice = temp.map(d => scl(d));
    console.log(juice);

    for (var j = 0; j < dab.length; j++) {
      dab[j][ft_name] = juice[j];
    }
  }

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

  // calculates the size of the radars
  let radarSizeScale = d3.scaleLinear()
  .domain([0,1])
  .range([0,6]);
  
  // let radarSizeScale = d3.scaleLinear()
  // .domain(d3.extent(dab, d => d))
  // .range([0,50]);

  let dabScale = d3.scaleLinear()
  .domain(d3.extent([0, 100]))
  .range([0, 10]);

  // let dabScale = d3.scaleLinear()
  // .domain(d3.extent(dab, d => ft_name[d]))
  // .range([0, 10]);
  
  let ticks = [5, 10];  // rings at 50 % & 10 %

  // draws rings
  ticks.forEach(t =>
  svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 100)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("r", radarSizeScale(t))
  );

  // calculates coordinate based on angle
  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radarSizeScale(value);
    let y = Math.sin(angle) * radarSizeScale(value);
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

  // some setup for actual vis
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
        // console.log(data_point[ft_name]);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        // coordinates.push(angleToCoordinate(angle, dabScale(data_point[ft_name])));
    }

    // console.log(coordinates);
    return coordinates;
  }


  //draw the path element
  svg.append("path")
  .datum((d,i) => getPathCoordinates(nested[i].values[0]))
  .attr("d", line)
  .attr("stroke-width", 3)
  .attr("stroke", colors[0])
  .attr("fill", colors[0])
  .attr("stroke-opacity", 1)
  .attr("opacity", 0.5);


  // Add titles
  svg
  .append("text")
  .attr("text-anchor", "start")
  .attr("y", 25)
  .attr("x", 10)
  .text(function(d){ return(d.key)})
  // .style("fill", function(d){ return color(d.key) })
})