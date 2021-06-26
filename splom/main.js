//instantiate tooltip
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d['State']+"</h5>";
    });

var svg = d3.select('svg');
svg.call(toolTip);

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};
var cellPadding = 10;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var dataAttributes = ['total population', 'revenue', 'federal aid', 'outstanding debt', 'per pupil salaries', 'per pupil employee benefits', 'average sat score', 'average act score', 'act % students tested', 'IEP per 1000', 'youth substance abuse per 100', 'high school diploma %', 'bachelor degree %', 'advanced degree %', 'school lunch students', 'school lunch reduced %'];
var N = dataAttributes.length;

// Compute chart dimensions
var cellWidth = (svgWidth - padding.l - padding.r) / N;
var cellHeight = (svgHeight - padding.t - padding.b) / N;

// Global x and y scales to be used for all SplomCells
var xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);
// axes that are rendered already for you
var xAxis = d3.axisTop(xScale).ticks(6).tickSize(-cellHeight * N, 0, 0);
var yAxis = d3.axisLeft(yScale).ticks(6).tickSize(-cellWidth * N, 0, 0);
// Ordinal color scale for cylinders color mapping
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
// Map for referencing min/max per each attribute
var extentByAttribute = {};
// Object for keeping state of which cell is currently being brushed
var brushCell;

// ****** Add reusable components here ****** //
function SplomCell(x, y, col, row) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;
}

//instantiate brush object
var brush = d3.brush()
    .extent([[0, 0], [cellWidth - cellPadding, cellHeight - cellPadding]])
    .on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend);


d3.csv('education.csv', dataPreprocessor).then(function(dataset) {
    
        //cars = dataset;

        // Create map for each attribute's extent
        dataAttributes.forEach(function(attribute){
            extentByAttribute[attribute] = d3.extent(dataset, function(d){
                return d[attribute];
            });
        });

        // Pre-render gridlines and labels
        chartG.selectAll('.x.axis')
            .data(dataAttributes)
            .enter()
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', function(d,i) {
                return 'translate('+[(N - i - 1) * cellWidth + cellPadding / 2, 0]+')';
            })
            .each(function(attribute){
                xScale.domain(extentByAttribute[attribute]);
                d3.select(this).call(xAxis);
                d3.select(this).append('text')
                    .text(attribute)
                    .attr('class', 'axis-label')
                    .attr('transform', 'translate('+[cellWidth / 2, -20]+')');
            });
        chartG.selectAll('.y.axis')
            .data(dataAttributes)
            .enter()
            .append('g')
            .attr('class', 'y axis')
            .attr('transform', function(d,i) {
                return 'translate('+[0, i * cellHeight + cellPadding / 2]+')';
            })
            .each(function(attribute){
                yScale.domain(extentByAttribute[attribute]);
                d3.select(this).call(yAxis);
                d3.select(this).append('text')
                    .text(attribute)
                    .attr('class', 'axis-label')
                    .attr('transform', 'translate('+[-26, cellHeight / 2]+')rotate(270)');
            });


        // ********* Your data dependent code goes here *********//
        var cells = [];
        dataAttributes.forEach(function(attrX, col){
            dataAttributes.forEach(function(attrY, row){
                cells.push(new SplomCell(attrX, attrY, col, row));
            });
        });
        console.log(cells);

        //initialize
        SplomCell.prototype.init = function(g) {
            var cell = d3.select(g);

            cell.append('rect')
              .attr('class', 'frame')
              .attr('width', cellWidth - cellPadding)
              .attr('height', cellHeight - cellPadding);
        }

        //update cell based on incoming data
        SplomCell.prototype.update = function(g, data) {
            var cell = d3.select(g);

            // Update the global x,yScale objects for this cell's x,y attribute domains
            xScale.domain(extentByAttribute[this.x]);
            yScale.domain(extentByAttribute[this.y]);

            // Save a reference of this SplomCell, to use within anon function scopes
            var _this = this;

            var dots = cell.selectAll('.dot')
                .data(data, function(d){
                    return d.name +'-'+d.year+'-'+d.cylinders; // Create a unique id for the car
                });

            var dotsEnter = dots.enter()
                .append('circle')
                .attr('class', 'dot')
                .style("fill", function(d) { return colorScale(d.cylinders); })
                .attr('r', 4);

            dots.merge(dotsEnter).attr('cx', function(d){
                    return xScale(d[_this.x]);
                })
                .attr('cy', function(d){
                    return yScale(d[_this.y]);
                });
            //tooltip
            dotsEnter.on('mouseover', toolTip.show)
                .on('mouseout', toolTip.hide);

            dots.exit().remove();
        }

        //drawing the cells
        var cellEnter = chartG.selectAll('.cell')
            .data(cells)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr("transform", function(d) {
                // Start from the far right for columns to get a better looking chart
                var tx = (N - d.col - 1) * cellWidth + cellPadding / 2;
                var ty = d.row * cellHeight + cellPadding / 2;
                return "translate("+[tx, ty]+")";
        });

        cellEnter.append('g')
            .attr('class', 'brush')
            .call(brush);

        cellEnter.each(function(cell){
            cell.init(this);
            cell.update(this, dataset);
        });
        
    });

// *********Event listener functions go here *********//
function brushstart(cell) {
    // cell is the SplomCell object

    // Check if this g element is different than the previous brush
    if(brushCell !== this) {

        // Clear the old brush
        brush.move(d3.select(brushCell), null);

        // Update the global scales for the subsequent brushmove events
        xScale.domain(extentByAttribute[cell.x]);
        yScale.domain(extentByAttribute[cell.y]);

        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove(cell) {
    // cell is the SplomCell object

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = d3.event.selection;
    if(e) {

        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg.selectAll(".dot")
            .classed("hidden", function(d){
                return e[0][0] > xScale(d[cell.x]) || xScale(d[cell.x]) > e[1][0]
                    || e[0][1] > yScale(d[cell.y]) || yScale(d[cell.y]) > e[1][1];
            })
    }
}

function brushend() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}

// Remember code outside of the data callback function will run before the data loads

function dataPreprocessor(row) {
    return {
        'total population': row['total_population'],
        'revenue': +row['total_revenue'],
        'federal aid': +row['total_federal_aid'],
        'outstanding debt': +row['total_outstanding_debt'],
        'per pupil salaries': +row['per_pupil_salaries'],
        'per pupil employee benefits': +row['per_pupil_employee_benefits'],
        'average sat score': +row['sat_average_score'],
        'average act score': +row['avg_act_composite_score'],
        'act % students tested': +row['act_percent_students_tested'],
        'IEP per 1000': +row['IEP_per_1000'],
        'youth substance abuse per 100': +row['youth_substance_use_per_100'],
        'high school diploma %': +row['educational_attainment_hs_plus'],
        'bachelor degree %': +row['educational_attainment_bachelor_plus'],
        'advanced degree %': +row['educational_attainment_advanced_degree_plus'],
        'school lunch students': +row['school_lunches_num_students_enrolled'],
        'school lunch reduced %': +row['school_lunches_percent_students_free_lunch']
    };
}