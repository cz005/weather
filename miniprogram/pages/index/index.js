//index.js
const app = getApp()

Page({
  data: {
    scrollHeight: 0, // 滚动区域的高度
    iconImageHeight: 0,
    location: 'loading...',
    weatherArray: [],
    listArray: [], // json
    WeatherDataGenerateDateTime: "loading...",
    tips: "loading...",
    weatherIcon: "/images/icons/weather_icon_47.svg",
    currentTemperature: "N/A"
  },

  onLoad: function() {
    this.calcScrollHeight();
    let that = this;
    // 页面加载完毕获取用户定位信息
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        // 经纬度换算地址请求
        wx.request({
          url: 'https://api.gugudata.com/location/geodecode?appkey=68E6RVV84EPT&longitude=' + longitude + '&latitude=' + latitude,
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            that.setData({
              location: res.data.Data[0].Township + ',' + res.data.Data[0].District
            })
            wx.request({
              url: 'https://api.gugudata.com/weather/weatherinfo/region?appkey=NYJGU54PYJFDER&keyword=' + res.data.Data[0].District.replace('新区', ''),
              header: {
                'content-type': 'application/json' // 默认值
              },
              success (res) {
                wx.request({
                  url: 'https://api.gugudata.com/weather/weatherinfo?appkey=NYJGU54PYJFDER&code=' + res.data.Data[0].Code + '&days=7',
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success(res) {
                    console.log(res.data.Data);
                    that.setData({
                      weatherArray: that.remapData(res.data.Data)
                    });

                    let WeatherDataGenerateDateTime
                    if (res.data.Data.length > 0) {
                      let regex = /(\d{2}:\d{2}):\d{2}/g.exec(res.data.Data[0].WeatherDataGenerateDateTime);
                      console.log(regex, 'regex')
                      WeatherDataGenerateDateTime = regex[0]
                      that.setData({
                        WeatherDataGenerateDateTime: WeatherDataGenerateDateTime,
                        currentTemperature: res.data.Data[0].TemperatureHigh,
                        tips: '给娜宝儿:' + res.data.Data[0].LifeHelperWear.HelperContent.replace("。", ""),
                        weatherIcon: that.getWeatherIcon(res.data.Data[0].WeatherInfo)
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  // 计算滚动区域高度
  calcScrollHeight () {
    let that = this;
    let query = wx.createSelectorQuery().in(this);
    query.select('.top').boundingClientRect(function(res) {
      let topHeight = res.height;
      let screenHeight = wx.getSystemInfoSync().windowHeight;
      let scrollHeight = screenHeight - topHeight -70; // 屏幕的高度-头部高度 -标题栏70
      that.setData({
        scrollHeight: scrollHeight,
        iconImageHeight: topHeight / 2
      })
    }).exec()
  },

  remapData(data) {
    console.log(data, 'dddd')
    let listData = [];
    for (let i = 0; i < data.length; i++) {
      console.log(data[i], 'sss')
      data[i].weekday = this.getWeekday(data[i].WeatherDataGenerateDateTime);
      data[i].icon = this.getWeatherIcon(data[i].WeatherInfo);
      if (i != 0) {
        listData.push(data[i])
      }
    }
    this.setData({
      listArray: listData,
    });

    return data;
  },

  getWeekday(date) {
    var mydate = new Date(date);
    var myddy = mydate.getDay();
    var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekday[myddy];
  },
  getWeatherIcon(weather) {
    switch (weather) {
      case "多云转中雨":
        return "/images/icons/weather_icon_17.svg";
      case "多云转晴":
        return "/images/icons/weather_icon_3.svg";
      case "中雨转多云":
        return "/images/icons/weather_icon_8.svg";
      case "晴转多云":
        return "/images/icons/weather_icon_3.svg";
      case "多云":
        return "/images/icons/weather_icon_2.svg";
      case "雷阵雨转多云":
        return "/images/icons/weather_icon_24.svg"
      case "小雨":
        return "/images/icons/weather_icon_13.svg"
      case "小雨转晴":
        return "/images/icons/weather_icon_14.svg"
      case "多云转小雨":
        return "/images/icons/weather_icon_14.svg"
      case "阴":
        return "/images/icons/weather_icon_6.svg"
      case "阴转多云":
        return "/images/icons/weather_icon_49.svg"
        break;
    }
  }

})
