(function () {
  // ================================================
  // 1. DATA
  // ================================================
  const data = [
    { year: 2020, type: "Painting", count: 3 },
    { year: 2020, type: "Sculpture", count: 7 },
    { year: 2020, type: "Digital Art", count: 4 },
    { year: 2021, type: "Painting", count: 6 },
    { year: 2021, type: "Photography", count: 5 },
    { year: 2021, type: "Digital Art", count: 9 },
    { year: 2022, type: "Sculpture", count: 4 },
    { year: 2022, type: "Digital Art", count: 6 },
    { year: 2023, type: "Painting", count: 7 },
    { year: 2023, type: "Photography", count: 2 },
    { year: 2023, type: "Sculpture", count: 5 }
  ];

  // Aggregate: year → type → count
  const nested = d3.rollup(
    data,
    v => d3.sum(v, d => d.count),
    d => d.year,
    d => d.type
  );

  const years = Array.from(nested.keys()).sort(d3.ascending);
  const types = Array.from(new Set(data.map(d => d.type)));

  // Hawaiian color palette
  const colorMap = {
    "Painting": "#FF6B6B",      // Hibiscus
    "Sculpture": "#4ECDC4",    // Seafoam
    "Digital Art": "#FFD93D",  // Pineapple
    "Photography": "#95E1D3"   // Mint Lei
  };

  // ================================================
  // 2. SVG SETUP
  // ================================================
  const margin = { top: 40, right: 40, bottom: 70, left: 130 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#vis-scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scalePoint()
    .domain(years)
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleBand()
    .domain(types)
    .range([0, height])
    .padding(0.5);

  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.count)])
    .range([8, 32]);

  // ================================================
  // 3. AXES
  // ================================================
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("font-weight", "bold")
    .style("fill", "#2E8B57");

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "16px")
    .style("fill", "#2C3E50");

  // Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -90)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Art Type");

  // ================================================
  // 4. TOOLTIP
  // ================================================
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "rgba(46, 139, 87, 0.95)")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "12px")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("pointer-events", "none")
    .style("border", "2px solid #FFD700")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

  // ================================================
  // 5. UPDATE FUNCTION (Animation Core)
  // ================================================
  let currentYear = years[0];
  let timer = null;
  const duration = 1400;

  function update(year) {
    currentYear = year;
    d3.select("#current-year").text(year);

    const yearMap = nested.get(year) ?? new Map();

    const dots = svg.selectAll("circle")
      .data(types, d => d); // Key by type

    // EXIT
    dots.exit()
      .transition().duration(400)
      .attr("r", 0)
      .style("opacity", 0)
      .remove();

    // ENTER + UPDATE
    const enter = dots.enter().append("circle")
      .attr("cx", x(year))
      .attr("cy", d => y(d) + y.bandwidth() / 2)
      .attr("r", 0)
      .style("opacity", 0)
      .style("fill", d => colorMap[d] || "#ccc")
      .style("stroke", "#FFF")
      .style("stroke-width", 3)
      .on("mouseover", (event, d) => {
        const count = yearMap.get(d) || 0;
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`${d}<br>Year: ${year}<br>Count: ${count}`)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(400).style("opacity", 0));

    dots.merge(enter)
      .transition()
      .duration(duration)
      .ease(d3.easeElasticOut)
      .attr("cx", x(year))
      .attr("cy", d => y(d) + y.bandwidth() / 2)
      .attr("r", d => yearMap.has(d) ? r(yearMap.get(d)) : 0)
      .style("opacity", d => yearMap.has(d) ? 0.9 : 0);
  }

  // ================================================
  // 6. CONTROLS (Play, Pause, Slider)
  // ================================================
  // Add controls to page (you can move to HTML if preferred)
  const controls = d3.select("#vis-scatterplot").append("div")
    .attr("class", "controls")
    .style("text-align", "center")
    .style("margin-top", "20px")
    .style("font-family", "Fredoka One, cursive");

  controls.append("button")
    .text("Play")
    .style("margin", "0 8px")
    .on("click", () => {
      if (timer) return;
      timer = d3.interval(() => {
        const i = years.indexOf(currentYear);
        const next = years[(i + 1) % years.length];
        update(next);
        if (next === years[0]) pause();
      }, duration + 300);
      d3.select(this).attr("disabled", true);
      controls.select("#pause").attr("disabled", null);
    });

  controls.append("button")
    .attr("id", "pause")
    .text("Pause")
    .attr("disabled", true)
    .style("margin", "0 8px")
    .on("click", () => {
      if (timer) timer.stop();
      timer = null;
      controls.select("button").attr("disabled", null);
      d3.select(this).attr("disabled", true);
    });

  controls.append("span")
    .text("Year: ")
    .style("margin", "0 10px")
    .style("font-weight", "bold");

  controls.append("span")
    .attr("id", "current-year")
    .text(years[0])
    .style("font-size", "1.4em")
    .style("color", "#2E8B57");

  controls.append("input")
    .attr("type", "range")
    .attr("min", years[0])
    .attr("max", years[years.length - 1])
    .attr("value", years[0])
    .attr("step", 1)
    .style("width", "200px")
    .style("margin-left", "15px")
    .on("input", function () {
      if (timer) { timer.stop(); timer = null; }
      update(+this.value);
    });

  // ================================================
  // 7. INITIAL RENDER
  // ================================================
  update(years[0]);

})();