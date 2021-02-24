let parsedData = [];
$(()=>{
    let corpName = getParams('corpname');
    console.log(corpName)
    if ([undefined,null].includes(corpName)) alert("ERR");
    else {
        loadData(corpName);
    }
})

function loadData(corpName) {
    $.ajax({
        url: 'http://localhost:8000'+'/stock/'+corpName+'/?format=json',
        async: true,
        type: 'GET',
        beforeSend : function(xhr){
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        },
        error: () => {
            alert("서버와의 통신에 실패했습니다.")
        },
        success: function(xhr) {
            console.log(xhr);
            parsedData = xhr;
            $('#corp > div > #name').text(corpName);
            google.charts.load('current', {'packages': ['corechart']});
            google.charts.setOnLoadCallback(drawChart);
        }
    });
}

function drawChart(corpName) {
    const data = google.visualization.arrayToDataTable(parsedData);

    const options = {
        title: corpName, //종목이름
        legend: {position: 'bottom'},
        animation: {startup: 'True', duration: 400, easing: 'out'},
        candlestick: {
            fallingColor: {strokeWidth: 0, fill: '#0048ff'},
            risingColor: {strokeWidth: 0, fill: '#ff0000'}
        }
    };

    const chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}