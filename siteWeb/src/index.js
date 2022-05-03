import heuresDeCoucher from '../data/heureDeCoucher_Data.csv'
import detailsPeriodes from '../data/periodes_Data.csv'
import * as d3 from 'd3'

const slider = document.querySelector('#slider-input')
const btnPrevious = document.querySelector('#btn-previous')
const btnNext = document.querySelector('#btn-next')
const btnPause = document.querySelector('#btn-pause')
const btnPlay = document.querySelector('#btn-play')

let playing = false;

let heatmapgraphic = document.querySelector('#heatmap-graphic');
let allPeriodes = createAllPeriodesData(heuresDeCoucher)


/*********** MISE EN FORME DES DONNEES ***********/

/**
 * Créer un tableau de 7 case de long et 5 cases de haut pour un mois de données. 
 * Dans les cases contenant des donnes, il y a un objet {col, ligne, minuteMinuit, date}
 * @param {array} monthData 
 * @returns {array}
 */
function createHeatMapData(monthData) {

    let firstDayOfMonth = getFirstDayOfMonth(monthData[0].date.getFullYear(), monthData[0].date.getMonth());
    let nomJourSemaine = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
    let dataArray = [];
    let compteurJour = 0;

    for (let ligne = 0; ligne < 5; ligne++) {
        for (let col = 0; col < 7; col++) {
            let jourSemaine = nomJourSemaine[col]
            let added = false;

            if (compteurJour == 0 && col == convertGetDay(firstDayOfMonth.getDay())) {
                compteurJour++
            }
            if (compteurJour != 0) {
                for (let date of monthData) {
                    if (date.date.getDate() == compteurJour) {
                        dataArray.push({ "col": jourSemaine, "ligne": ligne, "minutesMinuit": date.minutesMinuit, "date": date.date })
                        added = true
                    }
                }
                compteurJour++
            } else if (compteurJour != 0 && !added) {
                dataArray.push({ "col": jourSemaine, "ligne": ligne, "minutesMinuit": null })
                compteurJour++
            }

        }
    }
    return dataArray;
}

/**
 * Crée un tableau contenant x tableaux qui correspondent chacun à un mois de données de la période
 * @param {array} periodData 
 * @returns 
 */
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

/**
 * Créer un tableau contenant x tableaux qui correspondent chacun à une période de donnée
 * @param {array} allData 
 * @returns 
 */
function createAllPeriodesData(allData) {
    let periodes = []
    let nbPeriodes = allData[allData.length - 1].periode
    for (let i = 0; i < nbPeriodes; i++) {
        let tempArray = []
        for (const date of allData) {
            if (date.periode == i + 1) {
                tempArray.push(date)
            }
        }
        periodes.push(createAllHeatMapDataFromPeriod(tempArray))
    }
    return periodes;
}

/**
 * Récupère et calcul les statistiques à afficher en dessous des heatmap
 * @param {int} periodeId 
 * @returns {Object}
 */
function getPeriodeStatistics(periodeId) {

    let periodeData = allPeriodes[periodeId - 1]
    let concatPeriodeData = periodeData[0]

    if (periodeData.length > 0) {
        for (let i = 1; i < periodeData.length; i++) {
            concatPeriodeData = concatPeriodeData.concat(periodeData[i])
        }
    }

    let minuitesMinuitFromPeriode = concatPeriodeData.map(d => {
        if (d.date.getDay() == 6 || d.date.getDay() == 5) {
            return { "minutesMinuit": d.minutesMinuit, "weekend": "weekend" }
        } else {
            return { "minutesMinuit": d.minutesMinuit, "weekend": "semaine" }
        }
    })

    let moyenneSemaine = 0;
    let nbWeekend = 0;
    let nbSemaine = 0;
    let moyenneWeekend = 0;
    let plusTard = 0;
    let plusTot = 0;

    for (const date of minuitesMinuitFromPeriode) {
        if (date.minutesMinuit > plusTard) {
            plusTard = date.minutesMinuit
        }
        if (date.minutesMinuit < plusTot) {
            plusTot = date.minutesMinuit
        }
        if (date.weekend == 'semaine') {
            moyenneSemaine += date.minutesMinuit
            nbSemaine++
        } else {
            moyenneWeekend += date.minutesMinuit
            nbWeekend++
        }
    }
    moyenneWeekend = moyenneWeekend / nbWeekend
    moyenneSemaine = (moyenneSemaine / nbSemaine)

    return { "plusTard": plusTard, "plusTot": plusTot, "moyenneSemaine": moyenneSemaine, "moyenneWeekend": moyenneWeekend }
}

/**
 * Retourne un objet date contenant le premier jour d'un mois donné dans un année
 * @param {int} year 
 * @param {int} month 
 * @returns {Date}
 */
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
}

/**
 * Renvoie un tableau contenant les données mise en forme au format {date, minutesMinuit}
 * @param {array} monthData 
 * @returns {array}
 */
function getUsableDates(monthData) {
    let usableMonthData = []

    for (let date of monthData) {
        usableMonthData.push({ "date": new Date(date.dateFrom), "minutesMinuit": date.minutesMinuit })
    }

    return usableMonthData
}

/**
 * Converti le numéro d'un jour dans un format ou 0 = lundi et 6 = dimanche
 * @param {int} day 
 * @returns 
 */
function convertGetDay(day) {
    switch (day) {
        case 0:
            return 6
    }
    return day - 1
}

/**
 * Contverti un int de minutes en un string au format --H--M
 * @param {int} n 
 * @returns {String}
 */
function convertMinuites(n) {

    if (isNaN(n)) return "--H--M"

    let num = n;
    let hours = (num / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);

    if (n < 0) {
        return addZero(24 + rhours) + "h" + addZero(60 - rminutes) + "m";
    } else {
        return addZero(rhours) + "h" + addZero(rminutes) + "m";
    }
}

/**
 * Si le chiffre est plus petit que 10, rajout un 0 devant. 1 -> 01
 * @param {int} number 
 * @returns {String}
 */
function addZero(number) {
    if (number < 10) {
        return "0" + number
    }
    return number
}


/*********** AFFICHAGE + GRAPHIQUES ***********/

function displayHeatMap(chartData, heatMapID) {

    // set the dimensions and margins of the graph
    let margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 250 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // Labels of row and columns
    var semaine = [4, 3, 2, 1, 0]
    var jourSemaine = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]

    // append the svg object to the body of the page
    let idName = "heatmap-" + heatMapID
    let idNameSelector = "#heatmap-" + heatMapID

    d3.select("#heatmap-graphic").append("div").attr("id", idName)

    let currentHeatmapGraphic = d3.select(idNameSelector)
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
    currentHeatmapGraphic.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Build X scales and axis:
    var y = d3.scaleBand()
        .range([height, 0])
        .domain(semaine)
        .padding(0.01);
    // currentHeatmapGraphic.append("g")
    // .call(d3.axisLeft(y));

    // Build color scale
    var myColor = d3.scaleThreshold()
        .domain([-240, -120, 0, 120, 240, 360])
        .range(d3.schemeBlues[6])

    //Read the data
    currentHeatmapGraphic.selectAll()
        .data(chartData, function (d) { return d.col + ':' + d.ligne; })
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.col) + 2.5 })
        .attr("y", function (d) { return y(d.ligne) - 2.5 })
        .attr("width", x.bandwidth() / 1.1)
        .attr("height", y.bandwidth() / 1.1)
        .style("fill", function (d) { return myColor(d.minutesMinuit) })


    // Ajout du mois sous le graphic
    const formatter = new Intl.DateTimeFormat('fr', { month: 'long' })
    const currentMonth = formatter.format(chartData[0].date)
    const currentYear = chartData[0].date.getFullYear()

    let p = document.createElement("p")
    p.innerHTML = currentMonth + " " + currentYear
    p.classList.add('moisHeatMap')

    document.querySelector(idNameSelector).append(p)
}

function displayAllHeatMapFromPeriode(periodeId) {
    let periodeData = allPeriodes[periodeId - 1]
    while (heatmapgraphic.firstChild) {
        heatmapgraphic.removeChild(heatmapgraphic.firstChild);
    }
    let counter = 1
    for (const dataSet of periodeData) {
        displayHeatMap(dataSet, counter)
        counter++
    }
}

function displayStatisticsFromPeriode(periodeId) {
    let statistics = getPeriodeStatistics(periodeId)

    let plusTard = document.querySelector('#couchePlusTard span.heure')
    let plusTot = document.querySelector('#couchePlusTot span.heure')
    let moyenneSemaine = document.querySelector('#moyenneSemaine span.heure')
    let moyenneWeekend = document.querySelector('#moyenneWeekend span.heure')

    plusTard.innerHTML = convertMinuites(statistics.plusTard)
    plusTot.innerHTML = convertMinuites(statistics.plusTot)
    moyenneSemaine.innerHTML = convertMinuites(statistics.moyenneSemaine)
    moyenneWeekend.innerHTML = convertMinuites(statistics.moyenneWeekend)

}

function displeyPeriodeDetails(periodeId) {
    let periodeInfo = document.querySelector('#periodeInfos h3')
    console.log(detailsPeriodes);
    periodeInfo.innerHTML = detailsPeriodes[periodeId - 1].nom
}

function updateSlider(periodeId) {
    slider.value = periodeId;
}

function callDisplayFunctions(i){
    displayAllHeatMapFromPeriode(i)
    displayStatisticsFromPeriode(i)
    displeyPeriodeDetails(i)
    updateSlider(i)
}


/********** ANIMATION **********/

// Variable où on stocke l'id de notre intervalle
let nIntervId;

function animate() {
    // regarder si l'intervalle a été déjà démarré
    if (!nIntervId) {
        nIntervId = setInterval(play, 2000);
    }
}


let i = 1;

function play() {
    if (i >= allPeriodes.length || i < 0) {
        i = 1;
    } else {
        i++;
    }

    playing = true
    callDisplayFunctions(i)
}

// Mettre en pause
function stop() {
    clearInterval(nIntervId);
    nIntervId = null;
    playing = false
}


/********** LISTENERS **********/

slider.addEventListener('change', () => {
    i = slider.value
    callDisplayFunctions(i)
})
btnPrevious.addEventListener('click', () => {
    i--
    callDisplayFunctions(i)
})
btnNext.addEventListener('click', () => {
    i++
    callDisplayFunctions(i)
})
btnPause.addEventListener('click', () => stop())
btnPlay.addEventListener('click', () => {
    if (!playing) {
        animate()
    }
})

/***** APPEL DES FONCTIONS / CONFIG ******/
callDisplayFunctions(i);
animate()