  
  (function (){
  const data = [
    { year: 2020,type: "Painting",count: 3},
  {
  year: 2020,
  type: "Sculpture",
  count: 7
  },
  {
  year: 2020,
  type: "Digital Art",
  count: 4
  },
  {
  year: 2021,
  type: "Painting",
  count: 6
  },
  {
  year: 2021,
  type: "Photography",
  count: 5
  },
  {
  year: 2021,
  type: "Digital Art",
  count: 9
  },
  {
  year: 2022,
  type: "Sculpture",
  count: 4
  },
  {
  year: 2022,
  type: "Digital Art",
  count: 6
  },
  {
  year: 2023,
  type: "Painting",
  count: 7
  },
  {
  year: 2023,
  type: "Photography",
  count: 2
  },
  {
  year: 2023,
  type: "Sculpture",
  count: 5
  }
  ];
 

  // Aggregate data by year and type
  const aggregatedData = Array.from(d3.rollup(
  data,
  v => ({
  count: d3.sum(v, d => d.count),
  types: v.map(d => d.type) // Store types for tooltip
  }),
  d => d.year,
  d => d.type
  ), ([year, types]) => ({
  year,
  ...Object.fromEntries(types),
  })).map(item => {
  return Object.entries(item).reduce((acc, [key, value]) => {
  if (key === 'year') {
  acc[key] = value;
  return acc;
  }
  acc[key] = value.count
  acc[`types_${key}`] = value.types;
  return acc;
  }, {})
  });
 

  // Set up dimensions and margins
  const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 120 // Increased left margin
  };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
 

  // Create SVG element
  const svg = d3.select("#vis-scatterplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
 

  // Define scales
  const years = [...new Set(data.map(d => d.year))]; // Get unique years
  const xScale = d3.scalePoint()
  .domain(years)
  .range([0, width])
  .padding(0.5);
 

  const types = Array.from(new Set(data.map(d => d.type)));
  const yScale = d3.scaleBand()
  .domain(types)
  .range([0, height])
  .padding(0.5);
 

  const sizeScale = d3.scaleLinear()
  .domain([0, d3.max(Object.values(aggregatedData.reduce((acc, curr) => {
  delete curr.year;
  return {
  ...acc,
  ...curr
  }
  }, {})).filter(item => typeof item === 'number'))])
  .range([5, 20]); // Adjust the range for dot size as needed
 

  // Create dots
  svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.type) + yScale.bandwidth() / 2) // Center the circle in the band
  .attr("r", d => sizeScale(d.count))
  .style("fill", "steelblue")
  .style("opacity", 0.7)
  .on("mouseover", function(event, d) { // Add tooltip on hover
  tooltip.transition()
  .duration(200)
  .style("opacity", .9);
  tooltip.html(`Year: ${d.year}<br>Type: ${d.type}<br>Count: ${d.count}`)
  .style("left", (event.pageX) + "px")
  .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function(event, d) {
  tooltip.transition()
  .duration(500)
  .style("opacity", 0);
  });
 

  // Add axes
  svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale).tickSizeOuter(0));
 

  svg.append("g")
  .call(d3.axisLeft(yScale).tickSizeOuter(0))
  .selectAll(".tick text") // Select the text elements of the y-axis ticks
  .attr("class", "y-axis-label"); // Apply the class for styling
 

  // Add axis labels
  svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 5)
  .style("text-anchor", "middle")
  .text("Year");
 

  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Type of Work");
 

  // Add tooltip div
  const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

})();