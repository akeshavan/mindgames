paper.install(window)
window.plotted = false
Vue.filter("formatNumber", function (value) {
  return numeral(value).format("0.0[0]"); // displaying other groupings/separators is possible, look at the docs
});


function plotD3(selector, selectorParent, data, axisLabels){
  //based on
  // http://bl.ocks.org/weiglemc/6185069

  console.log("data is", data)
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $(selectorParent).width() - margin.left - margin.right,
    height = $(selectorParent).height() - margin.top - margin.bottom;

  /*
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */

  // setup x
  var xValue = function(d) { return d.x;}, // data -> value
      xScale = d3.scaleLinear().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.axisBottom(xScale);

  // setup y
  var yValue = function(d) { return d.y;}, // data -> value
      yScale = d3.scaleLinear().range([height, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.axisLeft(yScale);

  // setup fill color
  //var cValue = function(d) { return d.Manufacturer;},
  //    color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var svg = d3.select(selector)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([0, d3.max(data, xValue)]);
  yScale.domain([0, 1]);

  if (window.plotted){
    console.log("already plotted...")


    var svg = d3.select(selector)
    console.log("svg and selector are", svg, selector)

    /*svg.select('.x.axis')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.select('.y.axis')
      .call(yAxis);*/

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .attr("cx", xMap)
        .attr("cy", yMap)

    // update dots (i.e add new ones)
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 7)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return "steelblue";})
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html("<br/> (" + xValue(d)
            + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        })
        .on("click", onClick);

    //remove dots
    svg.selectAll(".dot")
       .data(data)
       .exit()
       .remove()

  }
  else{
    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(axisLabels.x);

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(axisLabels.y);

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 7)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return "steelblue";})
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html("<br/> (" + xValue(d)
  	        + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        })
        .on("click", onClick);
  }


    window.resizeGraph = function() {
      var width = $(selectorParent).width() - margin.left - margin.right,
          height = $(selectorParent).height() - margin.top - margin.bottom;

      var svg = d3.select(selector)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)

      console.log("width is", width, "height is", height)

      xScale.range([0, width]).nice();
      yScale.range([height, 0]).nice();

      yAxis.ticks(Math.max(height/50, 2));
      xAxis.ticks(Math.max(width/50, 2));

      svg.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.select('.y.axis')
        /*.attr("transform", "rotate(-90)")*/
        .call(yAxis);


      svg.selectAll('.dot')
      .attr("cx", xMap)
      .attr("cy", yMap)
    }
    window.plotted = true
    resizeGraph()
    //d3.select(window).on('resize', resizeGraph);
}

var app =  new Vue({
    el: '#main',
    data: {
      user_data: [],
      user_info: {},
      all_users: [],
      current_user: null,
      current_image: null,
      hover_idx: null,
    },
    methods: {
      query: function(){
        return 'mask?where={"mode":"try","user_id":"' +this.current_user + '"}&max_results=100 '
      },
      plotter: function(){

        /*var TESTER = document.getElementById('tester');
        var d3 = Plotly.d3;
        var WIDTH_IN_PERCENT_OF_PARENT = 100,
            HEIGHT_IN_PERCENT_OF_PARENT = 50;

        var gd3 = d3.select('#tester')
            .style({
                width: WIDTH_IN_PERCENT_OF_PARENT + '%',
                'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

                height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
                'margin-top': 0
            });

        window.gd = gd3.node();*/

        var to_plot = {x:[], y:[], type:"scatter", mode:'markers', marker:{size:10}}
        var me = this
        var dataset = []
        this.user_data.forEach(function(d, idx, arr){
                  dataset.push({x: idx+1, y: d.score})
                })
        plotD3("#svg","#tester", dataset, {x:"Try", y:"Dice"})



      },

      setPlayer: function(player){
        //set_user(player)
        app.current_user = player;
        a.remove("user_id")
        a.set("user_id", player)
        //a.go()
        console.log("not refreshing?")
        window.history.pushState({path:a.url},'',a.url);
        set_user(player)
      }

    }
  })

var url = 'http://api.medulina.com/api/v1/'
//var init_user = '5991b1bdf441bd00082835a3'
//app.current_user = init_user;
//var query = 'mask?where={"mode":"try","user_id":"' +app.current_user + '"}&max_results=100 '
var size = null


onClick = function(data){

    app.hover_idx = data.x
    if (window.base){
      console.log("clearing base..")
      //window.base.clear()

    }
    try_data = app.user_data[data.x];

    $.get(url+"image/"+try_data.image_id, function(data){
      //app.current_image = "data:image/png;base64," + data.pic
      console.log("starting a base raster")
      if (!window.base){
        window.base = new Raster({
         crossOrigin: 'anonymous',
         source: 'data:image/jpeg;base64,' + data.pic
        });
        window.roi = new Raster({})
      } else{
        window.base.setSource('data:image/jpeg;base64,' + data.pic)
        window.roi.clear()
      }


      window.base.onLoad = function(){
        initializeBaseRaster(window.base)
        initialize_roi_raster(window.base,window.roi)
        console.log("initialized rasters")
        $.get(url+'mask?where={"mode":"truth","image_id":"' + try_data.image_id + '"}', function(data){
          console.log("got truth", data)
          window.roi.fillPixelLog(data._items[0].pic, draw.LUT)
          window.roi.fillPixelLog(try_data.pic, draw.LUT)
          window.roi.diff(data._items[0].pic)
        });
      }

    })
};

function get_data(url,query, updater, callback){

  if (query != null){
    $.get(url+query, function(data){
      //app.user_data = app.user_data.concat(data._items);
      //console.log(updater)
      updater(data)
      if (data._links.next){
        console.log("getting next", url+query)
        get_data(url, data._links.next.href, updater, callback)
      }
      else{
        callback()
      }
    });
  }
}

var user_query = "user?sort=-total_score"
get_data(url,
         user_query,
         function(data){app.all_users = app.all_users.concat(data._items);},
         function(){
           console.log("done getting all users")

         })

function set_user(user){

  app.current_user = user;

  get_data(url, 'user/'+ user, function(data){
    console.log(data)
    app.user_info = data
  },
  function(){
    console.log("done getting user")
    app.user_data = []
    get_data(url,
             app.query(),
             function(data){
               app.user_data = app.user_data.concat(data._items);
               console.log("appending...", data._items, app.user_data.length)
             },
             function(){
               console.log("done getting all user tries", user, app.query(), app.user_data.length)
               try {
                 //Plotly.deleteTraces('tester', 0);
               } catch (e) {
                 console.log("the error is", e)
               }

               app.plotter()
             })
  })
}

//app.current_user = init_user
//set_user(app.current_user)

var a = new QS()
var params = a.getAll()

Object.keys(params).indexOf("user_id") >= 0 ? set_user(params["user_id"]) : null

window.onresize = function() {
    console.log("gu")
    Plotly.Plots.resize(window.gd);
};
