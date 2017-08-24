paper.install(window)

Vue.filter("formatNumber", function (value) {
  return numeral(value).format("0.0[0]"); // displaying other groupings/separators is possible, look at the docs
});

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
        var TESTER = document.getElementById('tester');
        var to_plot = {x:[], y:[], type:"scatter", mode:'markers', marker:{size:10}}
        var me = this
        this.user_data.forEach(function(d, idx, arr){
          to_plot.x.push(idx)
          to_plot.y.push(d.score)
        })
        Plotly.newPlot('tester', [to_plot], {
          margin: { t: 10 } ,
          yaxis: {range: [0, 1]}}
        )

        TESTER.on('plotly_hover', function(data){
            var pts = '';
            var idx = null

            for(var i=0; i < data.points.length; i++){
                idx = data.points[i].x
            }
            try_data = me.user_data[idx];
            app.hover_idx = idx
            if (window.base){
              console.log("clearing base..")
              //window.base.clear()

            }

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
        });

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
                 Plotly.deleteTraces('tester', 0);
               } catch (e) {
                 console.log(e)
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
