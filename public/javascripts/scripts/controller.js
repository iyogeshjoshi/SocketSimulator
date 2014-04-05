/**
 * Created with JetBrains WebStorm.
 * User: Yogesh Joshi
 * Date: 1/4/14
 * Time: 11:08 PM
 * To change this template use File | Settings | File Templates.
 */

// main controller
stockApp.controller('StockCtrl', function ($scope) {
    $scope.title = "Stock simulator";
    $scope.companyData = [];
    $scope.coampanies = [];
    // chart config
    $scope.chartConfig = {
//    new Highcharts.Chart('StockChart', {
        options: {
            chart: {
                type: 'spline',
                zoomType: 'x',
                backgroundColor: 'transparent'
            },
            rangeSelector: {
                enabled: true,
                inputEnabled: false,
                selected: 8,
                buttons: [
                    {
                        type: 'day',
                        count: 1,
                        text: '1d'
                    },
                    {
                        type: 'day',
                        count: 5,
                        text: '5d'
                    },
                    {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    },
                    {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    },
                    {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    },
                    {
                        type: 'ytd',
                        text: 'YTD'
                    },
                    {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    },
                    {
                        type: 'all',
                        text: 'All'
                    }
                ]
            },
            scrollbar: {
                liveRedraw: true
            },
            xAxis: {
                dateTimeLabelFormats: {
                    millisecond: '%H:%M:%S',
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%e. %b',
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                }
            },
            plotOptions: {
                candlestick: {
                    dataGrouping: {
                        enabled: true,
                        forced: true,
                        smoothed: true
                    },
                    marker: {
                        enabled: true
                    },
                    visible: true
                },
                column: {
                    stacking: 'normal',
                    grouping: true
                },
                line: {
                    dataGrouping: {
                        enabled: true,
                        forced: true,
                        smoothed: true
                    }
                },
                spline: {
                    dataGrouping: {
                        enabled: true,
                        forced: true,
                        smoothed: true
                    }
                }
            }
        },
        useHighStocks: true,
        credits: {
            enabled: true,
            href: 'http://www.iyogeshjoshi.com',
            text: 'Yogesh Joshi'
        },
        series: [
            {
                name: 'Google Inc.',
                data: $scope.companyData
            }
        ],
        title: {
            text: 'Stock Market Analysis'
        },

        loading: false
    };

    // on socket event
    socket.on('companyData', function (data) {
        var value = {
            x: data.time,
            y: data.price
        };
        $scope.$apply(function () {
            $scope.companyData.concat(value);
        });
    });
    // get list of all companies
    socket.on('companyList', function (data) {
        console.log('event');
        console.log(data);
        $scope.companies = data;
        /*$scope.$apply(function () {
         var seriesIndex = $scope.chartConfig.series.length - 1;
         angular.forEach($scope.companies[0].data, function (point, index) {
         $scope.companies[0].data[index].x = point.time;
         $scope.companies[0].data[index].y = point.price;
         })
         $scope.companies[0].seriesIndex = seriesIndex;
         $scope.chartConfig.series[0] = {
         data: $scope.companies[0].data
         };
         $scope.chartConfig.series[0].name = $scope.companies[0].name;

         })*/
        // subscribe each company to its event
        angular.forEach($scope.companies, function (company, companyIndex) {
            var seriesIndex = companyIndex;
            angular.forEach($scope.companies[companyIndex].data, function (point, index) {
                $scope.companies[companyIndex].data[index].x = point.time;
                $scope.companies[companyIndex].data[index].y = point.price;
            })
            $scope.companies[companyIndex].seriesIndex = seriesIndex;
            if (seriesIndex == 0)
                visible = true;
            else
                visible = false;
            $scope.chartConfig.series[seriesIndex] = {
                data: $scope.companies[companyIndex].data,
                visible: visible,
                marker: {
                    enabled: false
                }
            };
            $scope.chartConfig.series[seriesIndex].name = $scope.companies[companyIndex].name;
            // subscribe to data event
            socket.on(company.ticker, function (data) {
                $scope.$apply(function () {
                    data.x = data.time;
                    data.y = data.price;

                    $scope.companies[companyIndex].data.push(data);
                    console.log('event ' + company.ticker);

                });
            })
        })
    });

    $scope.addPoints = function (value, seriesIndex) {
        var seriesArray = $scope.chartConfig.series
//        var rndIdx = Math.floor(Math.random() * seriesArray.length);
        seriesArray[seriesIndex].data = seriesArray[seriesIndex].data.concat(value);
        $scope.$apply(function () {
            $scope.chartConfig.series = seriesArray;
        });
    };

    $scope.addSeries = function () {
        var rnd = []
        for (var i = 0; i < 10; i++) {
            rnd.push(Math.floor(Math.random() * 20) + 1)
        }
        $scope.chartConfig.series.push({
            data: rnd,
            animation: {
                duration: 2000
            }
        })
    }

    $scope.removeRandomSeries = function () {
        var seriesArray = $scope.chartConfig.series
        var rndIdx = Math.floor(Math.random() * seriesArray.length);
        seriesArray.splice(rndIdx, 1)
    }

    $scope.swapChartType = function () {
        if (this.chartConfig.options.chart.type === 'line') {
            this.chartConfig.options.chart.type = 'bar'
        } else {
            this.chartConfig.options.chart.type = 'line'
            this.chartConfig.options.chart.zoomType = 'x'
        }
    }

    $scope.toggleLoading = function () {
        this.chartConfig.loading = !this.chartConfig.loading
    }

    $scope.makeVisible = function (seriesIndex) {
        console.log('visible called');
//        $scope.$apply(function(){
        $scope.chartConfig.series[seriesIndex].visible = true;
//        })
    }

    $scope.makeInvisible = function (seriesIndex) {
        console.log('visible called');
//        $scope.$apply(function(){
        $scope.chartConfig.series[seriesIndex].visible = false;
//        })
    }

//    $scope.chartConfig = {
//        options: {
//            chart: {
//                type: 'bar'
//            }
//        },
//        series: [{
//            data: [10, 15, 12, 8, 7],
//            animation: {
//                duration: 2000
//            }
//        }],
//        title: {
//            text: 'Hello'
//        },
//
//        loading: false
//    }
});