//

// wrapper for responsive graph resize
function responsiveWrapper() {

  var svgArea = d3.select('body').select('svg')

//  clear SVG
  if (!svgArea.empty()) {
    svgArea.remove()
  }


  // Define SVG area dimensions
  var svgWidth = 980
  var svgHeight = 620

  // Define the chart's margins as an object
  var chartMargin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };

  // Define dimensions of the chart area
  var chartWidth = svgWidth - chartMargin.left - chartMargin.right
  var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom

  // Select body, append SVG area to it, and set the dimensions
  var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)

  // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
  // to the margins set in the "chartMargin" object.
  var chartGroup = svg
    .append('g')
    .attr('transform', `translate(${chartMargin.left}, ${chartMargin.top})`);

  // values to be charted
  var xValue = 'poverty';
  var yValue = 'healthcare';

  // func to update xScale labels when clicked
  function xScale (healthData, xValue) {
    // func to set the x axis scale of the chart
    var xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(healthData, d => d[xValue]) * 0.5,
        d3.max(healthData, d => d[xValue]) * 1.0
      ])
      .range([0, chartWidth])
    return xLinearScale;
  };

  // func to update yScale labels when clicked
  function yScale (healthData, yValue) {
    // func to set the y axis scale of the chart
    var yLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(healthData, d => d[yValue]) * 0.5,
        d3.max(healthData, d => d[yValue]) * 1.0
      ])
      .range([chartHeight, 0])
    return yLinearScale;
  };

  // Func to update xAxis when axis label is clicked
  function updateXAxes (newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale)
    xAxis
      .transition()
      .duration(1500)
      .call(bottomAxis)
    return xAxis
  }

  // Func to update yAxis when axis label is clicked
  function updateYAxes (newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale)
    yAxis
      .transition()
      .duration(1500)
      .call(leftAxis)
    return yAxis;
  };

  // update circles + transition to new circles
  function renderCircles (
    circlesGroup, 
    newXScale, 
    xValue,
    newYScale, 
    yValue
    ) {
    circlesGroup
    .transition()
    .duration(1500)
    .attr('cx', d => newXScale(d[xValue]))
    .attr('cy', d => newYScale(d[yValue]))
    return circlesGroup;
  };

  // update text transition
  function renderText (
    textGroup,
    newXScale,
    xValue,
    newYScale,
    yValue
  ) {
    textGroup
      .transition()
      .duration(1500)
      .attr('x', d => newXScale(d[xValue]))
      .attr('y', d => newYScale(d[yValue]))
      .attr('text-anchor', 'middle') 
    return textGroup
  };

    //  Update tooltips for circle gp
    function updateToolTip (xValue, yValue, circlesGroup, textGroup) {
      if (xValue === 'poverty') {
        var xLabel = 'Poverty (%)'
      } else if (xValue === 'age') {
        var xLabel = 'Age (median)'
      } else {
        var xLabel = 'Income (median)'
      }
      if (yValue === 'healthcare') {
        var yLabel = 'Healthcare (%)'
      } else if (yValue === 'obesity') {
        var yLabel = 'Obesity (%)'
      } else {
        var yLabel = 'Smokers (%)'
      }

      // Create tooltips
      var tool_tip = d3.tip()
        .attr('class', 'tooltip d3-tip')
        .offset([90, 90])
        .html(function (d) {
          return `<strong>${d.abbr}</strong><br>${xLabel} ${d[xValue]}<br>${yLabel} ${d[yValue]}`
        })
      
      // circles tooltips with event listeners 
      circlesGroup.call(tool_tip)
      circlesGroup
        .on('mouseover', function (data) {
          tool_tip.show(data, this)
        })
        .on('mouseout', function (data) {
          tool_tip.hide(data)
        })
      // text tooltips with event listeners
      textGroup.call(tool_tip)
      textGroup
        .on('mouseover', function (data) {
          tool_tip.show(data, this)
        })
        .on('mouseout', function (data) {
          tool_tip.hide(data)
        })
      return circlesGroup
    };

    //read in the data from data.csv

  d3.csv('assets/data/data.csv').then(function (healthData) {
    healthData.forEach(function (data) {
      data.poverty = +data.poverty
      data.age = +data.age
      data.income = +data.income
      data.healthcare = +data.healthcare
      data.obesity = +data.obesity
      data.smokes = +data.smokes
    })
    console.log(healthData);

    // x and y linear scale funcs for the chart
    var xLinearScale = xScale(healthData, xValue)
    var yLinearScale = yScale(healthData, yValue)

    //
    var bottomAxis = d3.axisBottom(xLinearScale)
    var leftAxis = d3.axisLeft(yLinearScale)

    // append x axis to chart
    var xAxis = chartGroup
      .append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(bottomAxis)
    
    // append y axis
    var yAxis = chartGroup
      .append('g')
      .classed('y-axis', true)
      .call(leftAxis)

    // initial circles created and appended
    var circlesGroup = chartGroup
      .selectAll('.stateCircle')
      .data(healthData)
      .enter()
      .append('circle')
      .attr('cx', d => xLinearScale(d[xValue]))
      .attr('cy', d => yLinearScale(d[yValue]))
      .attr('class', 'stateCircle')
      .attr('r', 12, dy = '.4em')
      .attr('opacity', '0.70')

      //  text appended to circles
      var textGroup = chartGroup
        .selectAll('.stateText')
        .data(healthData)
        .enter()
        .append('text')
        .attr('x', d => xLinearScale(d[xValue]))
        .attr('y', d => yLinearScale(d[yValue]))
        .text(d => d.abbr)
        .attr('class', 'stateText')
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('fill', 'grey')
    
    // Additional gp x axis labels
    var xLabelsGp = chartGroup
    .append('g')
    .attr('transform', `translate(${chartWidth /2}, ${chartHeight + 20})`)

    var povLabel = xLabelsGp
      .append('text')
      .attr('x',0)
      .attr('y',20)
      // for event listener
      .attr('value', 'poverty')
      .classed('active', true)
      .text('Poverty (%)')

    var ageLabel = xLabelsGp
      .append('text')
      .attr('x', 0)
      .attr('y', 40)
      // for event listenter
      .attr('value', 'age')
      .classed('inactive', true)
      .text('Age (median)')

    var incLabel = xLabelsGp
      .append('text')
      .attr('x', 0)
      .attr('y', 60)
      //
      .attr('value', 'income')
      .classed('inactive', true)
      .text('Income (median)')     

    // y axis gps
    var yLabelsGp = chartGroup
      .append('g')
      .attr('transform', `translate(-20, ${chartHeight / 2})`)

    // Append yAxis
    var hcLabel = yLabelsGp
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', 0)
      .attr('value', 'healthcare')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('active', true)
      .text('Healthcare (%)')

    var smkLabel = yLabelsGp
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', 0)
      .attr('value', 'smokes')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('inactive', true)
      .text('Smokes (%)')

    var obsLabel = yLabelsGp
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -70)
      .attr('x', 0)
      .attr('value', 'obesity')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('inactive', true)
      .text('Obesity (%)')
    
      // tooltip update
      var circlesGroup = updateToolTip(
        xValue,
        yValue,
        circlesGroup,
        textGroup
      )

      //Event listener for x axis labels
    xLabelsGp.selectAll('text').on('click', function () {
      var value = d3.select(this).attr('value')
      if (value !== xValue) {
          xValue = value
          xLinearScale = xScale(healthData, xValue)
          xAxis = updateXAxes(xLinearScale, xAxis)

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          xValue,
          yLinearScale,
          yValue
        )

        textGroup = renderText(
          textGroup,
          xLinearScale,
          xValue,
          yLinearScale,
          yValue
        )

        circlesGroup = updateToolTip(
          xValue,
          yValue,
          circlesGroup,
          textGroup
        )
        if (xValue === 'poverty') {
          povLabel.classed('active', true).classed('inactive', false)
          ageLabel.classed('active', true).classed('inactive', false)
          incLabel.classed('active', true).classed('inactive', false)
        } else if (xValue === 'age') {
          povLabel.classed('active', false).classed('inactive', true)
          ageLabel.classed('active', true).classed('inactive', false)
          incLabel.classed('active', false).classed('inactive', true)
        } else {
          povLabel.classed('active', false).classed('inactive', true)
          ageLabel.classed('active', false).classed('inactive', true)
          incLabel.classed('active', true).classed('inactive', false)
        }
      }
    })
    

    yLabelsGp.selectAll('text').on('click', function () {

      var value = d3.select(this).attr('value')

      if (value !== yValue) {

        yValue = value

        yLinearScale = yScale(healthData, yValue)

        yAxis = updateYAxes(yLinearScale, yAxis)

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          xValue,
          yLinearScale,
          yValue
        )
        // Updates Text with New Values
        textGroup = renderText(
          textGroup,
          xLinearScale,
          xValue,
          yLinearScale,
          yValue
        )
        // Updates Tooltips with New Information
        circlesGroup = updateToolTip(
          xValue,
          yValue,
          circlesGroup,
          textGroup
        )
        
        if (yValue === 'healthcare') {
          hcLabel.classed('active', true).classed('inactive', false)
          obsLabel.classed('active', false).classed('inactive', true)
          smkLabel.classed('active', false).classed('inactive', true)
        } else if (yValue === 'obesity') {
          hcLabel.classed('active', false).classed('inactive', true)
          obsLabel.classed('active', true).classed('inactive', false)
          incLabel.classed('active', false).classed('inactive', true)
        } else {
          hcLabel.classed('active', false).classed('inactive', true)
          obsLabel.classed('active', false).classed('inactive', true)
          smkLabel.classed('active', true).classed('inactive', false)
        }

      }
    })
  })
}
responsiveWrapper()

// call wrapper when window resized
d3.select(window).on('resize', makeResponsive)



