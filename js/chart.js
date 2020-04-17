let resultado = [];  /// var to cheack the data 
let paises = [];
let southAmerica = [];
let t = 0;
let paisesArray = ["Argentina","Ecuador","Peru","Chile","Mexico","Brazil","Bolivia","Colombia"];
let confirmed = [];
let names = [];
let sumaUs = 0;
let prueva = [];
let totales = {Deaths:0 , Confirmed : 0 , Recovered : 0};
let recoveredTotal = 0;
let confirmedTotal = 0;
var request2 = new XMLHttpRequest();
request2.open('GET', 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?where=OBJECTID>0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=');


request2.onload = function() {
    // let southAmerica =  []; // specific data to be call inside on request2.onload

  var response = request2.response;
  var parsedData = JSON.parse(response);
    resultado = parsedData;
    console.log(parsedData);

for (var i = 1; i <= resultado.features.length - 1; i++) {
  let str = resultado.features[i].attributes.Combined_Key;
  
  /// if is usa<<<<<<<<<<<<<<<<>>>>>>>>>>>
  if (str.includes("US") == true) {
    sumaUs = sumaUs + resultado.features[i].attributes.Confirmed;
  }
  /// if is usa<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>
    for (var s = 0; s <= paisesArray.length; s++) {
      if (resultado.features[i].attributes.Combined_Key == paisesArray[s] ) {
        southAmerica[t] =  resultado.features[i].attributes;
        confirmed[t] =  resultado.features[i].attributes.Confirmed;
        totales.Deaths = totales.Deaths + resultado.features[i].attributes.Deaths;
        totales.Confirmed = totales.Confirmed + resultado.features[i].attributes.Confirmed;
        totales.Recovered = totales.Recovered + resultado.features[i].attributes.Recovered;
        t++;
      } 
    } /// end of for 

} // end of for  resultado.features.length
 // paisesArray[paisesArray.length ] = 'US'; 
 // confirmed[confirmed.length ] = sumaUs; 
  console.log(southAmerica);
  
 confirmed = confirmed.sort(function(a, b){return a-b});
console.log(confirmed);
console.log("this is the sum" + sumaUs);


////////<<<<<<<<<<<<<<<<d3 drow>>>>>>>>>>>>>>>>>>>>>





chart('Confirmed');

} /// end of ajax request 


request2.send();





let navApi = document.getElementById('navApi');
    let chooser = "";

navApi.addEventListener("click",function (event) {
 
  if (event.target.tagName == "LI") {
    switch (event.target.innerHTML) {
      case "Fallecimientos":
      chooser = 'Deaths';
        break;
       case "Infectados":
        // statements_1
      chooser = 'Confirmed';

        break;
        case "Recuperados":
      chooser = 'Recovered';
        // statements_1
        break;
        
      default:
        // statements_def
        break;
    }

  };
chart(chooser);


 // document.querySelector("#container").innerHTML = "";
 // document.querySelector("#container").innerHTML = "<svg/>";


},true);
  


  function chart(dataType ){
    console.log(" this is the total " + totales[dataType]);
    document.querySelector("#container svg").innerHTML = ''; // delete the another chart

    const svg = d3.select('svg');
    const svgContainer = d3.select('#container');
    
    const margin = 80;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;

    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain( southAmerica.map((s) => s.Combined_Key))
      .padding(0.1)
    
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max( southAmerica.map((s) => s[dataType]) )]);



    // vertical grid lines
    // const makeXLines = () => d3.axisBottom()
    //   .scale(xScale)

    const makeYLines = () => d3.axisLeft()
      .scale(yScale)

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .call(d3.axisLeft(yScale));

    // vertical grid lines
    // chart.append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', `translate(0, ${height})`)
    //   .call(makeXLines()
    //     .tickSize(-height, 0, 0)
    //     .tickFormat('')
    //   )

    chart.append('g')
      .attr('class', 'grid')
      .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
      )

    const barGroups = chart.selectAll()
      .data(southAmerica) //  
      .enter()
      .append('g')

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (g) => xScale(g.Combined_Key))
      .attr('y', (g) => yScale(g[dataType]))
      .attr('height', (g) => height - yScale(g[dataType]))
      .attr('width', xScale.bandwidth())
      .on('mouseenter', function (actual, i) {
        d3.selectAll('.value')
          // .attr('opacity', 0)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 0.6)
          .attr('x', (a) => xScale(a.Combined_Key) - 5)
          .attr('width', xScale.bandwidth() + 5)

        const y = yScale(actual[dataType])

        line = chart.append('line')
          .attr('id', 'limit')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', width)
          .attr('y2',y)

        barGroups.append('text')
          .attr('class', 'divergence')
          .attr('x', (a) => xScale(a.Combined_Key) + xScale.bandwidth() / 2)
          .attr('y', (a) => yScale(a[dataType]) + 10)
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .text((a) => {
            let porcentaje  = (a[dataType] / totales[dataType]) * 100;
            return    porcentaje.toFixed(2) + "% " ;
          })

      })

      .on('mouseleave', function () {
        d3.selectAll('.value')
          .attr('opacity', 1)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 1)
          .attr('x', (a) => xScale(a.Combined_Key))
          .attr('width', xScale.bandwidth())

        chart.selectAll('#limit').remove()
        chart.selectAll('.divergence').remove()
      })

    barGroups 
      .append('text')
      .attr('class', 'value')
      .attr('x', (a) => xScale(a.Combined_Key) + xScale.bandwidth() / 2)
      .attr('y', (a) => yScale(a[dataType]) -5 )
      .attr('text-anchor', 'middle')
      .text((a) => `${a[dataType]}`)
    
    svg
      .append('text')
      .attr('class', 'label')
      .attr('x', -(height / 2) - margin)
      .attr('y', margin / 2.4)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      // .text('Love meter (%)')

    svg.append('text')
      .attr('class', 'label')
      .attr('x', width / 2 + margin)
      .attr('y', height + margin * 1.7)
      .attr('text-anchor', 'middle')
      // .text('Languages')

    svg.append('text')
      .attr('class', 'title')
      .attr('x', width / 2 + margin)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text( (a) => ` Total de Covid19 ${dataType} casos en Sudamerica:  ${totales[dataType]}`)

    svg.append('text')
      .attr('class', 'source')
      .attr('x', width - margin / 2)
      .attr('y', height + margin * 1.7)
      .attr('text-anchor', 'start')
      .text('Roberto Araque')
  
////////<<<<<<<<<<<<<<<<d3 drow>>>>>>>>>>>>>>>>>>>>>
}// end of chart funcion