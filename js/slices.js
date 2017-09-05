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

  if (window.plotted){
    console.log("already plotted...")

    var svg = d3.select(selector)
    console.log("svg and selector are", svg, selector)

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
        .style("fill", function(d) { return "#87BCDE";})
        .on("mouseover", function(d) {
            svg.selectAll(".dot").style("fill", highlighterOn(d))
        })
        .on("mouseout", function(d) {
            svg.selectAll(".dot").style("fill", highlighterOff(d))
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
        .text("HELLO???");

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
        .style("fill", function(d) { return "#87BCDE";})
        .on("mouseover", function(d) {
          svg.selectAll(".dot").style("fill", highlighterOn(d))

        })
        .on("mouseout", function(d) {
          svg.selectAll(".dot").style("fill", highlighterOff(d))
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


function get_data_recursive(url,query, updater, callback){

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

Vue.filter("formatNumber", function (value) {
  return numeral(value).format("0.0[0]"); // displaying other groupings/separators is possible, look at the docs
});

Vue.filter("formatInt", function (value) {
  return numeral(value).format("0"); // displaying other groupings/separators is possible, look at the docs
});

paper.install(window)

var app =  new Vue({
    el: '#main',
    data: {
      task: "db_cor_context03",
      image_entries: [],
      next: null,
      current_image: {},
      current_image_tries: [],
      current_image_score: null,
      current_truth: {},
    },
    methods: {
      query: function(){
        if (!app.next){
          return 'image/?where={"task":"' + this.task + '"}'
        }
        else {
          return app.next.href
        }

      },
      toggleTruth: function(){
        roi.visible = !roi.visible
      },
      toggleTries: function(){
        roi2.visible = !roi2.visible
      },
      setImage: function(image){

        this.current_image = image
        this.current_image_tries = []
        this.current_truth = {}

        a.remove("image_id")
        a.set("image_id", image._id)
        //a.go()
        console.log("not refreshing?")
        window.history.pushState({path:a.url},'',a.url);
        //set_user(player)

        base = new Raster({
         crossOrigin: 'anonymous',
         source: 'data:image/jpeg;base64,' + image.pic
        });
        roi = new Raster({})
        roi2 = new Raster({})


        base.onLoad = function(){
          initializeBaseRaster(base)
          initialize_roi_raster(base,roi, 1)
          initialize_roi_raster(base,roi2, 0.5)
          console.log("initialized rasters")

        }
        var me = this
        var vote = {}
        var max_vote = 0

        getTruth(this.current_image._id, function(data){
          me.current_truth = data._items[0]
          roi.fillPixelLog(me.current_truth.pic, {0: "black", 1: "yellow"})

          getTries(me.current_image._id, function(data){
            me.current_image_tries = me.current_image_tries.concat(data._items)
            var ave_score = 0

            me.current_image_tries.forEach(function(val, idx, arr){
              ave_score += val.score
            });
            console.log("averaging", ave_score, data._items.length)
            me.current_image_score = ave_score/data._items.length

            /*collapse across user scores*/
            me.current_image_tries.forEach(function(val, idx, arr){
              var roi_temp = new Raster({})
              initialize_roi_raster(base,roi_temp, 0)
              roi_temp.visible = false

              //roi_temp.fillPixelLog(me.current_truth.pic, {0: "black", 1: "red"})
              roi_temp.fillPixelLog(val.pic, {0: "black", 1: "red"})

              for (ii in roi_temp.pixelLog){
                if (vote[ii] == undefined){
                  vote[ii] = {}
                }
                for (jj in roi_temp.pixelLog[ii]){
                  if (vote[ii][jj] == undefined && roi_temp.pixelLog[ii][jj] != undefined && roi_temp.pixelLog[ii][jj] != NaN){
                    vote[ii][jj] = roi_temp.pixelLog[ii][jj]
                    //console.log("vote", ii, jj, vote[ii][jj])
                  } else if (roi_temp.pixelLog[ii][jj] != undefined) {
                    vote[ii][jj] = vote[ii][jj] + roi_temp.pixelLog[ii][jj]
                    if (vote[ii][jj] == NaN){
                      consolelog("vote is nan", ii, jj)
                    }
                  }

                  if (vote[ii][jj] > max_vote){
                    max_vote = vote[ii][jj]
                  }
                }
              }
            });
            console.log("vote max is", max_vote, "vote is", vote)
            var LUT = {0:draw.LUT[0]}
            for (i=1; i<max_vote+1; i++){
              LUT[i] = d3.interpolateCool(i/max_vote)
            }
            roi2.fillPixelLog(vote, LUT);


          });
        });
      },
      getData: function(){
        getData()
      }
    }
  })

var url = 'http://api.medulina.com/api/v1/'

function getData(){
  $.get(url + app.query(), function(data){
    console.log("data from /image is", data)
    app.image_entries = app.image_entries.concat(data._items)
    app.next = data._links.next
  })
}

getData()

function getTries(image_id, callback){
  console.log(url + 'mask/?where={"mode":"try","image_id":"' +image_id + '"}')
  $.get(url + 'mask/?where={"mode":"try","image_id":"' +image_id + '"}', callback)
}

function getTruth(image_id, callback){
    console.log(url + 'mask/?where={"mode":"try","image_id":"' +image_id + '"}')
    $.get(url + 'mask/?where={"mode":"truth","image_id":"' +image_id + '"}', callback)

}

function set_image(image_id){
  $.get(url + "image/"+image_id, function(data){
    app.current_image = data
    app.setImage(data);
  });
}

var a = new QS()
var params = a.getAll()

Object.keys(params).indexOf("image_id") >= 0 ? set_image(params["image_id"]) : null
