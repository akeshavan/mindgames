paper.install(window)

window.plotted = false

Vue.filter("formatNumber", function (value) {
  return numeral(value).format("0.0[0]"); // displaying other groupings/separators is possible, look at the docs
});

/*
  Some D3 highlight options
*/

var highlighterOn = function(d){
  return function(dat) {
    return dat == d ? colors.teal : dat == window.currentClicked ? colors.bright : colors.light
  }
}

var highlighterOff = function(d){
  return function(dat) { return dat == window.currentClicked ? colors.bright: colors.light;}
}

var colors = {
  "bright": "#FF595E",
  "light": "#87BCDE",
  "dark": "#313E50",
  "teal": "#0E7C7B"
}



/*
  Prepare the D3 SVG and axis
*/

function prepare(selectorParent, selector, axisLabels){
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
      yScale = d3.scaleLinear().range([height, 0]), // value -> display Note order swap (bottom is higher)
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

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")") //take X to bottom of SVG
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "black")
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
      .style("fill", "black")
      .text(axisLabels.y);

  return {xValue: xValue, yValue:yValue, xScale: xScale,
          yScale: yScale, xMap: xMap, yMap, yMap,
          xAxis: xAxis, yAxis: yAxis, svg: svg, margin:margin, width: width, height: height}
}

/*
  Populate the prepared SVG with data
*/

function populate(data, prep){
  prep.xScale.domain([0, d3.max(data, prep.xValue)]);
  prep.yScale.domain([0, 1]);

  // update dots (i.e add new ones)
  var foo = prep.svg.selectAll(".dot")
      .data(data)

    foo.enter().append("circle")
      .attr("class", "dot")
      .attr("cx", prep.xMap)
      .attr("cy", prep.yMap)
      .merge(foo)
      .style("fill", function(d) { return "#87BCDE";})
       .attr("r", 1) // Change size
      .transition()
        .duration(1000)
        .attr("r", 7)

  //Initiate the voronoi function
  //Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
  //The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
  //(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
  var wrapper = prep.svg.append("g").attr("class", "chordWrapper")
  			.attr("transform", "translate(" + prep.margin.left + "," + prep.margin.top + ")");

  var voronoi = d3.voronoi()
  	.x(function(d) { return prep.xScale(d.x); })
  	.y(function(d) { return prep.yScale(d.y); })(data)
  	.extent([[0, 0], [prep.width, prep.height]]);


  prep.svg.on('mousemove', function() {

    var p = d3.mouse(this)
    p[0] -= prep.margin.left;
    p[1] -= prep.margin.top;
    var maxDistanceFromPoint = 500;
    var site = voronoi.find(p[0], p[1], maxDistanceFromPoint);
    if (site){
      highlighterOn(site.data)
    }
    console.log("p is", p, site)

  })

  /*voronoiGroup.selectAll("path")
  	.data(voronoi(data)) //Use vononoi() with your dataset inside
  	.enter().append("path")
  	.attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
  	.datum(function(d, i) { return d.point; })
  	.attr("class", function(d,i) { return "voronoi " + d.CountryCode; }) //Give each cell a unique class where the unique part corresponds to the circle classes
  	//.style("stroke", "#2074A0") //I use this to look at how the cells are dispersed as a check
  	.style("fill", "none")
  	.style("pointer-events", "all")
  	.on("mouseover", function(d){console.log("mouseover", d)})
  	.on("mouseout",  function(d){console.log("mouseout", d)});*/


  prep.svg.selectAll(".dot")
      .on("mouseover", function(d) {
          prep.svg.selectAll(".dot").style("fill", highlighterOn(d))
      })
      .on("mouseout", function(d) {
          prep.svg.selectAll(".dot").style("fill", highlighterOff(d))
      })
      .on("click", onClick)



  //remove dots
  prep.svg.selectAll(".dot")
     .data(data)
     .exit()
     .remove()
}


/*
  Resize the graph appropriately
*/

window.resizeGraph = function(selector, selectorParent, prep) {
  var width = $(selectorParent).width() - prep.margin.left - prep.margin.right,
      height = $(selectorParent).height() - prep.margin.top - prep.margin.bottom;

  var svg = d3.select(selector)
      .attr("width", width + prep.margin.left + prep.margin.right)
      .attr("height", height + prep.margin.top + prep.margin.bottom)

  console.log("width is", width, "height is", height)

  prep.xScale.range([0, width]).nice();
  prep.yScale.range([height, 0]).nice();

  prep.yAxis.ticks(Math.max(height/50, 2));
  prep.xAxis.ticks(Math.max(width/50, 2));

  svg.select('.x.axis')
    .attr("transform", "translate(0," + height + ")")
    .call(prep.xAxis);

  svg.select('.x.axis')
    .selectAll(".label")
    .attr("x", width)

  svg.select('.y.axis')
    /*.attr("transform", "rotate(-90)")*/
    .call(prep.yAxis);


  svg.selectAll('.dot')
  .attr("cx", prep.xMap)
  .attr("cy", prep.yMap)
}

/*
  Render the Plot
*/


function plotD3(selector, selectorParent, data, axisLabels){
  //based on
  // http://bl.ocks.org/weiglemc/6185069

  console.log("data is", data)

  if (!window.plotted){
    window.prep = prepare(selectorParent, selector, axisLabels)
  }

  populate(data, prep)

  window.plotted = true
  resizeGraph(selector, selectorParent, prep)

}

var app =  new Vue({
    el: '#main',
    data: {
      user_data: [],
      user_data_meta: null,
      user_info: {},
      all_users: [],
      current_user: null,
      current_image: null,
      hover_idx: null,
    },
    computed: {
      rank: function(){
        var tmp = _.find(this.all_users, {"username": this.user_info.username})
        if (tmp){
          return tmp["rank"] + 1
        }
      },
    },
    methods: {
      query: function(){
        return 'mask?where={"mode":"try","user_id":"' +this.current_user + '"}&max_results=100&sort=-_created'
      },
      plotter: function(){

        var to_plot = {x:[], y:[], type:"scatter", mode:'markers', marker:{size:10}}
        var me = this
        var dataset = []
        this.user_data.forEach(function(d, idx, arr){
                  dataset.push({x: idx+1, y: d.score})
                })
        plotD3("#svg","#tester", dataset, {x:"Try #", y:"Dice Coefficient"})

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
    var svg = d3.select("#svg")
    window.currentClicked = data;
    svg.selectAll(".dot").style("fill", function(dat) { return dat == data ? "#FF595E": "#87BCDE";})

    app.hover_idx = data.x - 1;
    if (window.base){
      console.log("clearing base..")
      //window.base.clear()

    }
    try_data = app.user_data[data.x - 1];

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
           app.all_users.forEach(function(val, idx, arr){
             val["rank"] = idx
           })

         })

function set_user(user){

  app.current_user = user;

  get_data(url, 'user/'+ user, function(data){
    console.log("setting rank...")
    app.user_info = data
  },
  function(){
    console.log("done getting user")
    app.user_data = []

    $.get(url+app.query(), function(data){
      app.user_data = data._items;
      app.user_data_meta = data._meta;
      console.log("some user tries are:", data)
      app.plotter();
    })

  })
}

/*
Grab the query string to get a user id
*/

var a = new QS()
var params = a.getAll()

Object.keys(params).indexOf("user_id") >= 0 ? set_user(params["user_id"]) : null
