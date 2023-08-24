


var options = {
    series: [{
    name: 'Inflation',
    data: []
  }],
    chart: {
    height: 350,
    type: 'bar',
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: 'top', // top, center, bottom
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return '₹'+val;
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ["#304758"]
    }
  },
  
  
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    position: 'top',
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    crosshairs: {
      fill: {
        type: 'gradient',
        gradient: {
          colorFrom: '#D8E3F0',
          colorTo: '#BED1E6',
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        }
      }
    },
    tooltip: {
      enabled: true,
    }
  },
  yaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      formatter: function (val) {
        return "₹"+val;
      }
    }
  
  },
  title: {
    text: 'Monthly Profit',
    floating: true,
    offsetY: 330,
    align: 'center',
    style: {
      color: '#444'
    }
  }
  };

  for (let i = 0; i < 12; i++) {
    let data = document.getElementById(`bar-datas-${i + 1}`);
    if(data == null){
      options.series[0].data.push(0)
    }
    else{
      let dataValues = data.value
      options.series[0].data.push(dataValues)
    }
  
  }

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();



  //piechart
  let cash = parseInt(document.getElementById('cash').value)
  let prepaid = parseInt(document.getElementById('prepaid').value)
  let wallet = parseInt(document.getElementById('wallet').value)

  var options = {
    series: [prepaid, wallet, cash],
    chart: {
    width: 380,
    type: 'pie',
  },
  labels: ['Prepaid', 'Wallet', 'Cash on delivery'],
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
  };

  var chart = new ApexCharts(document.querySelector("#pyChart"), options);
  chart.render();


