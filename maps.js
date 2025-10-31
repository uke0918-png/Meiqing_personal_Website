// maps.js
// ---------------------------------------------------------------
// 1. Inject HTML
// 2. Initialise Leaflet map + data
// ---------------------------------------------------------------

(() => {
  // ---------- 1. HTML INJECTION ----------
  const placeholder = document.getElementById('density-maps-placeholder');
  placeholder.id = 'density-maps';
  placeholder.innerHTML = `
    <div class="container">
      <header>
        <h1>我的中国旅行足迹</h1>
        <p class="subtitle">Dot Density Map · 点密度地图可视化</p>
      </header>

      <div class="map-container">
        <div id="map"></div>
        <div class="dot-info">
          <strong>图例说明：</strong><br>
          每个 <span style="color:#e74c3c;">Circle</span> 红色圆点 = <strong>1次到访</strong><br>
          点越大表示到访次数越多（叠加显示）
        </div>
        <div class="legend">
          <div class="legend-title">图例 / Legend</div>
          <div class="legend-item">
            <div class="legend-color" style="background:#e74c3c;"></div>
            <div class="legend-label">已到访城市</div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background:#3498db;"></div>
            <div class="legend-label">省份边界</div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:#7f8c8d;">
            <strong>Circle</strong> 1 dot = 1 visit
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat-item"><div class="stat-number" id="total-cities">0</div><div class="stat-label">到访城市</div></div>
        <div class="stat-item"><div class="stat-number" id="total-provinces">0</div><div class="stat-label">覆盖省份</div></div>
        <div class="stat-item"><div class="stat-number" id="total-visits">0</div><div class="stat-label">总到访次数</div></div>
      </div>

      <div class="info-panel">
        <div class="info-title">详细到访记录</div>
        <div class="places-grid" id="places-grid"></div>
      </div>

      <footer>
        <p>点密度地图展示旅行分布模式 · 颜色通道增强空间认知 · Created with Leaflet &amp; HTML/JS</p>
      </footer>
    </div>
  `;

  // ---------- 2. MAP LOGIC ----------
  const cityData = [
    { name:"南京", province:"江苏", lat:32.0617, lng:118.7778, visits:3 },
    { name:"上海", province:"上海", lat:31.2304, lng:121.4737, visits:5 },
    { name:"哈尔滨", province:"黑龙江", lat:45.7575, lng:126.6333, visits:2 },
    { name:"苏州", province:"江苏", lat:31.2990, lng:120.6196, visits:4 },
    { name:"西安", province:"陕西", lat:34.2655, lng:108.9541, visits:2 },
    { name:"北京", province:"北京", lat:39.9042, lng:116.4074, visits:6 },
    { name:"桂林", province:"广西", lat:25.2736, lng:110.2902, visits:1 },
    { name:"深圳", province:"广东", lat:22.5431, lng:114.0579, visits:3 },
    { name:"延吉", province:"吉林", lat:42.9065, lng:129.5089, visits:1 },
    { name:"齐齐哈尔", province:"黑龙江", lat:47.3543, lng:123.9182, visits:1 }
  ];

  const map = L.map('map').setView([35.5, 105], 4.5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  const dotGroup = L.layerGroup().addTo(map);

  const getDotStyle = (visits) => {
    const opacity = Math.min(0.9, 0.5 + visits * 0.08);
    const radius  = Math.min(18, 6 + visits * 2.5);
    return { radius, fillColor:"#e74c3c", color:"#c0392b", weight:1.5, opacity:1, fillOpacity:opacity, visits };
  };

  let totalVisits = 0;
  const provinces = new Set();

  cityData.forEach(city => {
    totalVisits += city.visits;
    provinces.add(city.province);

    const marker = L.circleMarker([city.lat, city.lng], getDotStyle(city.visits))
      .bindPopup(`
        <div style="font-family:system-ui;padding:2px;">
          <strong style="font-size:1.1em;color:#e74c3c;">${city.name}</strong><br>
          <span style="color:#7f8c8d;font-size:.9em;">${city.province}</span><br>
          <hr style="margin:6px 0;border:none;border-top:1px solid #eee;">
          <strong>到访 ${city.visits} 次</strong>
        </div>
      `, { offset:[0,-8] });

    marker.on('mouseover', function(){ this.setStyle({weight:3,color:'#f39c12',fillOpacity:.95}); });
    marker.on('mouseout',  function(){ this.setStyle(getDotStyle(city.visits)); });

    dotGroup.addLayer(marker);
  });

  document.getElementById('total-cities').textContent   = cityData.length;
  document.getElementById('total-provinces').textContent = provinces.size;
  document.getElementById('total-visits').textContent   = totalVisits;

  const grid = document.getElementById('places-grid');
  cityData.sort((a,b)=>b.visits-a.visits).forEach(c=>{
    const card = document.createElement('div');
    card.className='place-card';
    card.innerHTML = `<div class="place-name">${c.name}</div>
                      <div class="place-province">${c.province} · 到访 ${c.visits} 次</div>`;
    grid.appendChild(card);
  });

  map.on('zoomend', ()=>{
    const zoom = map.getZoom();
    const scale = Math.pow(1.3, zoom-5);
    dotGroup.eachLayer(l=>{
      const v = l.options.visits||1;
      l.setRadius(Math.min(20,(6+v*2.5)*scale));
    });
  });

  dotGroup.eachLayer(l=>{
    const ll = l.getLatLng();
    const city = cityData.find(c=>c.lat===ll.lat && c.lng===ll.lng);
    if(city) l.options.visits = city.visits;
  });

  if(window.innerWidth<768){
    setTimeout(()=>alert("提示：可双指缩放地图查看点密度分布"),800);
  }
})();