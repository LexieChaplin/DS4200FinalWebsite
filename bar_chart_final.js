// Function to create the boxplot
function createBoxPlot(data) {
    // Define dimensions and margins
    const width = 900;
    const height = 600;
    const margin = {
      top: 60,
      right: 120,
      bottom: 80,
      left: 80
    };
  
    // Create SVG container
    const svg = d3.select("#boxplot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#ffffff");
  
    // Get unique sleep stages and group types
    const sleepStages = ["Light", "Deep", "REM"];
    const groupTypes = ["Below Normal", "Normal", "Above Normal"];
    
    // Create scales
    // X scale for sleep stages
    const x = d3.scaleBand()
      .domain(sleepStages)
      .range([margin.left, width - margin.right])
      .padding(0.2);
    
    // Calculate the width of each box plot
    const boxWidth = x.bandwidth() / groupTypes.length - 4;
    
    // Y scale for heart rate variability
    const y = d3.scaleLinear()
      .domain([10, 120]) // Set fixed range based on reference image
      .range([height - margin.bottom, margin.top]);
    
    // Color scale for group types
    const color = d3.scaleOrdinal()
      .domain(groupTypes)
      .range(["#A9CCE3", "#5499C7", "#1A5276"]);
  
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat("")
      )
      .style("stroke", "#e0e0e0");
  
    svg.selectAll(".grid line")
      .style("stroke", "#e0e0e0");
  
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-family", "Helvetica")
      .style("font-size", "16px");
    
    // Add Y axis
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-family", "Helvetica")
      .style("font-size", "16px");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-family", "Helvetica")
      .style("font-size", "24px")
      .text("HRV by Sleep Stage % Classification");
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 3)
      .attr("text-anchor", "middle")
      .style("font-family", "Helvetica")
      .style("font-size", "16px")
      .text("Sleep Stage");
    
    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", margin.left / 3)
      .attr("text-anchor", "middle")
      .style("font-family", "Helvetica")
      .style("font-size", "16px")
      .text("HRV");
  
    // Function to calculate box plot statistics
    function calculateStats(values) {
      values.sort(d3.ascending);
      
      const min = d3.min(values);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const max = d3.max(values);
      
      const iqr = q3 - q1;
      const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
      const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
      
      // Find outliers
      const outliers = values.filter(v => v < lowerWhisker || v > upperWhisker);
      
      return { min, q1, median, q3, max, lowerWhisker, upperWhisker, outliers };
    }
  
    // Group data by Sleep Stage and Group Type
    const nestedData = d3.group(data, d => d.Sleep_Stage, d => d.Group_Type);
    
    // Draw box plots
    sleepStages.forEach((stage, stageIndex) => {
      groupTypes.forEach((groupType, groupIndex) => {
        const groupData = nestedData.get(stage)?.get(groupType);
        
        if (groupData && groupData.length > 0) {
          const values = groupData.map(d => d.Heart_rate_variability_ms);
          const stats = calculateStats(values);
          
          // Calculate x position for this specific box
          const xPos = x(stage) + (groupIndex * (x.bandwidth() / groupTypes.length));
          
          // Draw vertical line (from lower whisker to upper whisker)
          svg.append("line")
            .attr("x1", xPos + boxWidth / 2)
            .attr("x2", xPos + boxWidth / 2)
            .attr("y1", y(stats.lowerWhisker))
            .attr("y2", y(stats.upperWhisker))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
          
          // Draw box from Q1 to Q3
          svg.append("rect")
            .attr("x", xPos)
            .attr("y", y(stats.q3))
            .attr("width", boxWidth)
            .attr("height", y(stats.q1) - y(stats.q3))
            .attr("fill", color(groupType))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
          
          // Draw median line
          svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(stats.median))
            .attr("y2", y(stats.median))
            .attr("stroke", "black");
          
          // Draw whisker ends (horizontal lines)
          svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(stats.lowerWhisker))
            .attr("y2", y(stats.lowerWhisker))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
            
          svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(stats.upperWhisker))
            .attr("y2", y(stats.upperWhisker))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
          
          // Draw outliers as circles
          stats.outliers.forEach(outlier => {
            svg.append("circle")
              .attr("cx", xPos + boxWidth / 2)
              .attr("cy", y(outlier))
              .attr("r", 3)
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("stroke-width", 1);
          });
        }
      });
    });
  
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    
    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text("Group Type")
      .style("font-family", "Helvetica")
      .style("font-size", "14px")
      .style("font-weight", "bold");
    
    groupTypes.forEach((groupType, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 25 + 5)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color(groupType));
      
      legend.append("text")
        .attr("x", 25)
        .attr("y", i * 25 + 18)
        .text(groupType)
        .style("font-family", "Helvetica")
        .style("font-size", "14px");
    });
    
  }
  
// Initialize plot
  d3.csv("d3_data.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.Heart_rate_variability_ms = +d.Heart_rate_variability_ms;
    });
    createBoxPlot(data);
  });