import heuresDeCoucher from '../data/heureDeCoucher_Data.csv'
import * as d3 from 'd3'


/*********** MISE EN FORME DES DONNEES ***********/

function createHeatMapData(monthData) {

    let firstDayOfMonth = getFirstDayOfMonth(monthData[0].date.getFullYear(), monthData[0].date.getMonth());
    let nomJourSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    let dataArray = [];
    let compteurJour = 0;

    for (let ligne = 0; ligne < 5; ligne++) {
        for (let col = 0; col < 7; col++) {
            let jourSemaine = nomJourSemaine[col]
            let added = false;

            // console.log(convertGetDay(firstDayOfMonth.getDay()))
            if (compteurJour == 0 && col == convertGetDay(firstDayOfMonth.getDay())) {
                compteurJour++
            }
            if (compteurJour != 0) {
                for (let date of monthData) {
                    if (date.date.getDate() == compteurJour) {
                        console.log(date.date.getDate())
                        console.log(compteurJour)
                        dataArray.push({ "col": jourSemaine, "ligne": ligne, "minutesMinuit": date.minutesMinuit })
                        added = true
                    }
                }
                compteurJour++
            }else if (compteurJour != 0 && !added) {
                dataArray.push({ "col": jourSemaine, "ligne": ligne, "minutesMinuit": null })
                compteurJour++
            }

        }
    }
    console.log(dataArray);
    return dataArray;
}

function createAllHeatMapDataFromPeriod(periodData) {
    let usableData = getUsableDates(periodData)
    let nbMonth = [];
    for (const date of usableData) {
        if (!nbMonth.includes(date.date.getMonth())) {
            nbMonth.push(date.date.getMonth())
        }
    }

    let allData = []
    for (let i = 0; i < nbMonth.length; i++) {
        allData.push([])
        for (let date of usableData) {
            if (date.date.getMonth() == nbMonth[i]) {
                allData[i].push(date)
            }
        }
    }

    let finalData = []
    for (let data of allData) {
        finalData.push(createHeatMapData(data))
    }
    return (finalData)
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
}

function getUsableDates(monthData) {
    let usableMonthData = []

    for (let date of monthData) {
        usableMonthData.push({ "date": new Date(date.dateFrom), "minutesMinuit": date.minutesMinuit })
    }

    return usableMonthData
}

function convertGetDay(day) {
    switch (day) {
        case 0:
            return 6
    }
    return day - 1
}


/*********** GRAPHIQUES ***********/

function displayHeatMap(chartData, heatMapID) {

    // set the dimensions and margins of the graph
    let margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // Labels of row and columns
    var semaine = [4, 3, 2, 1, 0]
    var jourSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    // var jourSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    // var jourSemaine = [0, 1, 2, 3, 4, 5, 6]

    // append the svg object to the body of the page
    let idName = "heatmap-" + heatMapID
    let idNameSelector = "#heatmap-" + heatMapID

    d3.select("#heatmap-graphic").append("div").attr("id", idName)

    let heatmapGraphic = d3.select(idNameSelector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

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
}

function displayAllHeatMap(allChartData) {
    d3.select("#heatmap-graphic").innerHTML = ''
    let counter = 1
    for (const dataSet of allChartData) {
        displayHeatMap(dataSet, counter)
        counter++
    }
}

/***** APPEL DES FONCTIONS ******/

let chartData = createAllHeatMapDataFromPeriod(heuresDeCoucher)
displayAllHeatMap(chartData)