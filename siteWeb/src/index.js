import heuresDeCoucher from '../data/heureDeCoucher_Data.csv'
import * as d3 from 'd3'


/*********** MISE EN FORME DES DONNEES ***********/

function createHeatMapData(monthData) {
    let usableMonthData = []

    for (let date of monthData) {
        usableMonthData.push({ "date": new Date(date.dateFrom), "minutesMinuit": date.minutesMinuit })
    }

    let firstDayOfMonth = getFirstDayOfMonth(usableMonthData[0].date.getFullYear(), usableMonthData[0].date.getMonth());

    let dataArray = [];
    let compteurJour = 0;

    for (let ligne = 0; ligne < 5; ligne++) {
        for (let col = 0; col < 7; col++) {
            let added = false;
            if (compteurJour == 0 && col == firstDayOfMonth.getDay()) {
                compteurJour++
            }
            if (compteurJour != 0) {
                compteurJour++
                for (let date of usableMonthData) {
                    if (date.date.getDate() == compteurJour - 1) {
                        dataArray.push({ "col": col, "ligne": ligne, "minutesMinuit": date.minutesMinuit })
                        added = true
                    }
                }
            }
            if (!added) {
                dataArray.push({ "col": col, "ligne": ligne, "minutesMinuit": null })
            }
        }
    }

    return dataArray;
}


function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
}

/*********** GRAPHIQUES ***********/

let chartData = createHeatMapData(heuresDeCoucher)

// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var heatmapGraphic = d3.select("#heatmap-graphic")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Labels of row and columns
var semaine = [4, 3, 2, 1, 0]
// var jourSemaine = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]
var jourSemaine = [0, 1, 2, 3, 4, 5, 6]

// Build X scales and axis:
var x = d3.scaleBand()
    .range([0, width])
    .domain(jourSemaine)
    .padding(0.01);
heatmapGraphic.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
    .range([height, 0])
    .domain(semaine)
    .padding(0.01);
heatmapGraphic.append("g")
    .call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
    .range(["white", "#69b3a2"])
    .domain([-100, 100])

//Read the data

heatmapGraphic.selectAll()
    .data(chartData, function (d) { return d.col + ':' + d.ligne; })
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.col) })
    .attr("y", function (d) { return y(d.ligne) })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) { return myColor(d.minutesMinuit) })

// console.log(heuresDeCoucher);