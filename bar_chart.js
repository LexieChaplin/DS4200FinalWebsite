// Load the data
const df = d3.csv("merged_dataset.csv");

// Plot
df.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d['Recovery score %'] = +d['Recovery score %'];
    });

    // Define the dimensions and margins for the SVG
    width = 600,
    height = 400;

    margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }

    // Create the SVG container
    svg = d3.select('#boxplot')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'white');
    
    // Set up scales for x and y axes

    const xScale =  d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain([...new Set(data.map(d => d.Sleep_Group))])
    .padding(0.5);

    const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d['Recovery score %']), d3.max(data, d => d['Recovery score %'])])
    .range([height - margin.bottom, margin.top]);

    // Add scales  
    const xaxis = svg.append('g')
    .call(d3.axisBottom().scale(xScale))
    .attr('transform', `translate(0,${height - margin.bottom})`);

    const yaxis = svg.append('g')
    .call(d3.axisLeft().scale(yScale))
    .attr('transform', `translate(${margin.left} , 0)`);

    // Add x-axis label
    svg.append('text')
      .text('Sleep Duration Group')
      .attr('x', width/2 - 80)
      .attr('y', height - 15)
      .style("font-family", "Helvetica");

    // Add y-axis label
    svg.append('text')
      .text('Recovery Score (%)')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0-height/2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style("font-family", "Helvetica");

    // Find quantiles for each group
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d['Recovery score %']).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };

    // Group data by Sleep Duration and calculate quantiles for each group 
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Sleep_Group);

    // Draw box plot for each group 
    // iterate thorugh platform groups and calculate quartiles
    quantilesByGroups.forEach((quantiles, Sleep_Group) => {
        // Calculate x position of the box plot
        const x = xScale(Sleep_Group);
        // Calculate y position of the box plot
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
        .attr("x1", x + boxWidth / 2)
        .attr("y1", yScale(quantiles.min))
        .attr("x2", x + boxWidth / 2)
        .attr("y2", yScale(quantiles.max))
        .attr("stroke", "black");

        // Draw box
        svg.append("rect")
        .attr("x", x)
        .attr("y", yScale(quantiles.q3))
        .attr("width", boxWidth)  
        .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
        .attr("fill", "lightblue")
        .attr("stroke", "black");

        svg.append("line")
        .attr("x1", x)
        .attr("x2", x + boxWidth)
        .attr("y1", yScale(quantiles.median))
        .attr("y2", yScale(quantiles.median))
        .attr("stroke", "black");
        
    });
});

