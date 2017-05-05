/* =============================================================================
                              RASTER FUNCTIONS
============================================================================= */

var all_rasters = []
window.all_rasters = all_rasters
window.onresize = function(){
  /*
    When the window size changes, change the bounds of all rasters
  */
  //all_rasters.map(function(r){r.fitBounds(view.bounds)})
  console.log("resizing")
  base.fitBounds(view.bounds)
  roi.fitBounds(view.bounds)
  window.zoomFactor = 1
}

/*$( window ).resize(function() {
  $( "#log" ).append( "<div>Handler for .resize() called.</div>" );
})*/

function copyImageData(ctx, src)
{
    var dst = ctx.createImageData(src.width, src.height);
    dst.data.set(src.data);
    return dst;
}

var initialize_base_raster = function(raster){
  /*
    Initialize the base image raster so that its visible, centered, and takes up
    the width of the window.

    Also make a copy of it to save as the original image so we can manipulate
    brightness and contrast
  */
  raster.visible = true;
  raster.position = view.center;
  raster.fitBounds(view.bounds);

  var tmpCanvas = document.createElement('canvas');
	tmpCanvas.width = raster.width;
	tmpCanvas.height = raster.height;
  var tmpCtx = tmpCanvas.getContext("2d")

  raster.origImg = copyImageData(tmpCtx,
  raster.canvas.getContext("2d").getImageData(0,0,raster.width, raster.height))

  //all_rasters[0] = raster
  if (!all_rasters.length){
    all_rasters.push(raster)
  }
  else{
    all_rasters[0] = raster
  }
}



var initialize_roi_raster = function(base_raster, roi_raster, alpha){
  /*
    Initialize the roi image so that its the same size and position of the
    base image, and also set the opacity to alpha (0.25 by default)
  */
  alpha = alpha || 0.25
  roi_raster.setSize(base_raster.size)
  initialize_base_raster(roi_raster)
  roi_raster.opacity = alpha //0.25
  roi_raster.initPixelLog()
  if (all_rasters.length == 1){
    all_rasters.push(roi_raster)
  }
  else{
    all_rasters[1] = roi_raster
  }

}



Raster.prototype.initPixelLog = function(){
  /*
    Adds the pixelLog attribute to the raster. Pixel log is a dictionary with
    index keys (0-width) and each value is another dictionary w/ keys (0-height)
    The values are initialized to null.
  */
  this.pixelLog = {}
  for (ii=0;ii<this.width;ii++){
    this.pixelLog[ii] = {}
    for (jj=0;jj<this.height;jj++){
      this.pixelLog[ii][jj] = 0
    }
  }
}

Raster.prototype.clear = function(){
  this.initPixelLog()
  for (ii=0;ii<this.width;ii++){
    for (jj=0;jj<this.height;jj++){
      this.setPixel(ii,jj,draw.LUT["0"])
    }
  }
}

Raster.prototype.diff = function(data){
  var score = {tp:0, fn:1, fp: 1}
  for (ii=0;ii<this.width;ii++){
    for (jj=0;jj<this.height;jj++){
      var current = this.pixelLog[ii][jj]
      if (data[ii]){
        var truth = data[ii][jj]
         if(truth==1 && current == 1){
           //true positive
           ++score.tp
           //turn green 195 192 170
           //this.setPixel(ii,jj,{red:195/255,blue:192/255,green:170/255, alpha:0.2})
         }
         else if (truth==1 && current == 0) {
           //false negative
           ++score.fn
           //turn red
           this.setPixel(ii,jj,"tomato")
         }
         else if(!truth && current == 1){
           //false positive
           ++score.fp

           //turn blue
           this.setPixel(ii,jj,"steelblue")
         };
      }

    }
  }
  this.opacity = 0.35
  return score
}

Raster.prototype.setPixelLog = function(x,y,color,paintVal){
  /*
    Sets the pixel and pixelLog at coordinate x,y to val. Val should be a color.
  */


  x = Math.floor(x)
  y = Math.floor(y)
  this.setPixel(x,y,color)
  if (!$.isNumeric(paintVal)){
    console.log("ERROR", paintVal, "not a number")
  }
  try {
    this.pixelLog[x][y]= paintVal //|| val
    return 0
  }
  catch(err){
    //console.log(x,y,"out of bounds")
    return 1
  }
}

Raster.prototype.setPixelLogNoColor = function(x,y,color, paintVal){
  /*
    Sets the pixel and pixelLog at coordinate x,y to val. Val should be a color.
  */

  x = Math.floor(x)
  y = Math.floor(y)
  //this.setPixel(x,y,val)
  if (!$.isNumeric(paintVal)){
    console.log("ERROR", paintVal, "not a number")
  }
  try {
    this.pixelLog[x][y]= paintVal //|| val
    return 0
  }
  catch(err){
    //console.log(x,y,"out of bounds")
    return 1
  }
}

Raster.prototype.fillPixelLog = function(obj,color_mapper){
  for (ii in obj){
    for (jj in obj[ii]){
      var val = obj[ii][jj]
      var color = color_mapper[val]
      this.setPixelLog(ii,jj,color, val)
    }
  }
}

Raster.prototype.fillPixelLogFlat = function(obj,val, color_mapper){
  var me = this
  obj.forEach(function(v, idx, arr){
      //var val = obj[ii][jj]
      var color = color_mapper[val]
      me.setPixelLog(v.x,v.y,color, val)
    })
}

// Thanks https://github.com/licson0729/CanvasEffects

Raster.prototype.process = function(func) {

  var pix = copyImageData(this.getContext("2d"), this.origImg)

  //Loop through the pixels
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      var i = (y * this.width + x) * 4;
      var r = pix.data[i],
        g = pix.data[i + 1],
        b = pix.data[i + 2],
        a = pix.data[i + 3];
      var ret = func(r, g, b, a, x, y);
      pix.data[i] = ret[0];
      pix.data[i + 1] = ret[1];
      pix.data[i + 2] = ret[2];
      pix.data[i + 3] = ret[3];
    }
  }

  this.setImageData(pix)

}


Raster.prototype.contrast = function(level) {

  var self = this;
  level = Math.pow((level + 100) / 100, 2);
  return this.process(function(r, g, b, a) {
    return [((r / 255 - 0.5) * level + 0.5) * 255 ,
            ((g / 255 - 0.5) * level + 0.5) * 255 ,
            ((b / 255 - 0.5) * level + 0.5) * 255 , a];
  });
}

Raster.prototype.brightness = function(bright, level) {

  var self = this;
  level = Math.pow((level + 100) / 100, 2);
  return this.process(function(r, g, b, a) {
    return [ r * bright,
             g * bright,
             b * bright, a];
  });
}

Raster.prototype.brightness_contrast = function(bright, level) {

  var self = this;
  level = Math.pow((level + 100) / 100, 2);
  return this.process(function(r, g, b, a) {
    return [((r / 255 - 0.5) * level + 0.5) * 255 * bright,
            ((g / 255 - 0.5) * level + 0.5) * 255 * bright,
            ((b / 255 - 0.5) * level + 0.5) * 255 * bright, a];
  });
}




/* =============================================================================
                          Filling and Painting FUNCTIONS
============================================================================= */

function doFloodFill(e, me){
  /*
    Starts the recursive flood fill on the raster starting from e.point
  */
  var local = xfm.get_local(e)
  console.log(local.x, local.y)
  console.log("targetVal", me.pixelLog[local.x][local.y])
  console.log("replacementVal", window.paintVal)
  if (!$.isNumeric(me.pixelLog[local.x][local.y])){
    console.log("is not a number!!")
    return
  }
  draw.floodFill(me, local, me.pixelLog[local.x][local.y], window.paintVal)
  draw.reset()
}

function drawLine(e, me){
  /*
    Draws a line from e.point to the previous point
  */
  var local = xfm.get_local(e)

  //console.log("paintval to", draw.LUT[window.paintVal])
  draw.addHistory(local.x, local.y,
                  me.pixelLog[local.x][local.y],
                  window.paintVal)
  me.setPixelLog(local.x, local.y, draw.LUT[window.paintVal], window.paintVal)

  if (draw.last != null){

    draw.line(local.x,
         local.y,
         draw.last.x,
         draw.last.y, draw.LUT[window.paintVal], me, paintVal)
  }
  draw.last = local

}

/* =============================================================================
                          TRANSFORMATION FUNCTIONS
============================================================================= */

xfm = {}

xfm.clamp = function(number, min, max){
  /*
    returns the number if number is between min or max. If number is > max,
    returns max. If number < min, returns min
  */
  max = max || 0
  min = min || 0
  return Math.max(min,Math.min(number, max))

}

xfm.clampPoint = function(point, min, max, minh, maxh){
  /*
    returns a Point w/ point.x and point.y clamped between min,max
  */
  min = min || 0
  max = max || 0
  return new Point({x: xfm.clamp(point.x, min,max),
    y: xfm.clamp(point.y, minh, maxh)})

}

xfm.get_local = function(e){
  /*
    super weird coordinate transform. Make the center of the image 0,0 (because
    that is how the local coordinate system is referenced), then
    clamp the point, and then move 0,0 back to the top left for raster pixel
    refence space.
  */
  var width = base.size.width
  var height = base.size.height
  var half_w = width / 2
  var half_h = height / 2
  var local = base.globalToLocal(e.point)
  var local = xfm.clampPoint(local, 0-half_w, half_w, 0-half_h, half_h)
  local.x =  Math.floor(local.x+half_w)
  local.y = Math.floor(local.y+half_h)
  return local
}

/* =============================================================================
                              DRAWING FUNCTIONS
============================================================================= */

draw = {}
draw.last = null
draw.counter = 0
draw.history = [[]]

draw.LUT = {0: {red: 0, green:0, blue:0, alpha:0},
            1: "darkviolet",
            2: "cyan",
            3: "gold",
            4: "plum",
            5: "goldenrod"}

draw.reset = function(){
  /*
    reset the last drawn point and the flood fill counter
  */

  draw.last = null
  draw.counter = 0
  window.panFactor.x = 0
  window.panFactor.y = 0
  if (draw.history[draw.history.length-1].length){
  draw.history.push([])}
  //console.log("draw history", draw.history)

}

draw.addHistory = function(x0,y0,oldval,newval){
  /*
    Add an item to history so we can revert. Save coordinates x0, y0,
    and the oldval. Only save to history if there is a change (oldval != newval)
  */
  if (oldval != newval){
    draw.history[draw.history.length-1].push({x:x0, y:y0,
                                            prev:oldval})
  }
}

draw.revert = function(roi, init_pop){
  /*
    Revert based on history. if init_pop is 0 then it undo's a bad floodFill
  */
  if (init_pop == undefined){init_pop = 1}
  if (draw.history.length > 1){
    if (init_pop){
      draw.history.pop() //this one is always empty
    }
    var values = draw.history.pop()
    if (init_pop){
      values.forEach(function(val, idx, arr){
        roi.setPixelLog(val.x,val.y,draw.LUT[val.prev], val.prev)
      })
    }
    else{
      console.log("reverting w/ no color")
      values.forEach(function(val, idx, arr){
        if ($.isNumeric(val.prev)){
          roi.setPixelLogNoColor(val.x,val.y, draw.LUT[val.prev], val.prev)
        }
        else{
          console.log(val.prev)
        }
      })
    }
    draw.history.push([])
    //console.log(draw.history)
  }
}

draw.line = function(x0, y0, x1, y1, val, roi, paintVal){
  /*
    Algorithm to connect two points with a line
  */
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;
   var new_arr = []

   while(true){

     draw.addHistory(x0,y0,roi.pixelLog[x0][y0],paintVal)
     roi.setPixelLog(x0,y0, val, paintVal);  // Do what you need to for this

     if (Math.abs(x0-x1) < 0.25 && Math.abs(y0-y1) < 0.25) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }

}

function Queue(item) {
  var inbox = []
  var outbox = [item]
  this.push = function(item) {inbox.push(item)}
  this.pop = function() {
    if (outbox.length === 0) {
      inbox.reverse()
      // swap the inbox and outbox
      var oldOutbox = outbox
      outbox = inbox
      inbox = oldOutbox
    }
    return outbox.pop()
  }
  Object.defineProperty(this, "length", { get: function() {
    return inbox.length + outbox.length
  }})
}


draw.floodFill = function(roi, node, targetVal, replacementVal){
  /*
    flood fill algorithm. roi = roi raster object, node is an object
    with keys x,y that refer to the raster-space pixels
  */

  var num_fill = 0
  var to_fill = {}
  if (targetVal === replacementVal) {return}
  if (roi.pixelLog[node.x][node.y] != targetVal) {return}
  function neighboors(y) {
    var nei = [];
    if (y > 0) {nei.push(y - 1)}
    if (y < roi.height - 1) {nei.push(y + 1)}
    return nei
  }

  var queue = new Queue(node)
  while (queue.length > 0) {
    node = queue.pop();
    var x = node.x;
    var y = node.y;
    if (roi.pixelLog[x][y] != targetVal) {continue}

    while (x > 0 && roi.pixelLog[x - 1][y] === targetVal) {
      x -= 1;
    }

    var nei = neighboors(y);
    while (x < (roi.width - 1) && roi.pixelLog[x][y] === targetVal) {
      draw.addHistory(x, y, roi.pixelLog[x][y], replacementVal);
      roi.setPixelLogNoColor(x, y, draw.LUT[replacementVal], replacementVal);
      ++num_fill
      for (i = 0; i < nei.length; i++){
        var y_nei = nei[i]
        if (roi.pixelLog[x][y_nei] === targetVal) {
          queue.push({x:x, y:y_nei})
        }
      }
      x += 1;
    }
  }// end while loop

  console.log(num_fill)
  if (num_fill < 30000){
    roi.fillPixelLogFlat(draw.history[draw.history.length-1], replacementVal, draw.LUT)
  }
  else{
    alert("You are filling too much, close your loops")
    //draw.history = [[]]
    //console.log(draw.history)
    console.log("starting revert")
    startProgress()
    draw.revert(roi, 0)
    console.log("ending revert")
    stopProgress()
  }
  return
}


/*=============================================================================
                            CONTROLLER FUNCTIONS
=============================================================================*/

changeMode = function(e){
  /*
    Set the window's mode to e. e is a string. Examples "fill", "paint", etc
  */
  if (window.mode != "view"){
    window.prevMode = window.mode
  }
  else{
    if (e=="view"){
      $("#zoompan").removeClass("mdl-button--colored")
      e = window.prevMode
    }
  }

  window.mode = e
  //console.log("setting menu icon", window.mode)

  setMenuIcon(window.mode)
  //$("#currentTool").html(window.mode)

}




window.paintVal = 1
setPaintbrush = function(e){
  /*
    Set paintbrush value to integer(e). If e is not in the draw.LUT, set to 0.
  */
  //console.log("setting paintbrush value", e)
  if (Object.keys(draw.LUT).indexOf(e)<0){
    console.log("value not in lookup table. setting paintbrush to 0")
    e = 0
  }

  window.paintVal = parseInt(e)
}

window.zoomFactor = 1

doZoom = function(e){
  /*
    Zoom based on how far the user drags in the y direction
  */
  var zoomFactor = window.zoomFactor +  e.deltaY/200
  window.zoomFactor = xfm.clamp(zoomFactor, 1, 3)
  view.setZoom(window.zoomFactor)
}

window.panFactor = {x:0, y:0}

doPan = function(e){
  /*
    Pan based on how far the user drags in the x/y direction
  */

  window.panFactor.x = e.point.x - window.panMouseDown.point.x
  window.panFactor.y = e.point.y - window.panMouseDown.point.y

  view.translate(window.panFactor.x, window.panFactor.y)
}

window.brightCirclePos = new Point(view.viewSize.width/2, view.viewSize.height/2);
window.brightCircle = null

doBright = function(e){
  /*
    TODO: apply contrast value here too, this isn't right
  */
  //console.log("setting brightness")
  var amount = (parseInt(e) - 50)/50 + 1
  //console.log("bright", amount)
  //base.brightness(amount)
  return amount
}

doCont = function(e){
  /*
    Adjust brightness based on how far left/right of the center is clicked.
    Adjust contrast based on how far up/down of the center is clicked.
  */
  //console.log("setting brightness")
  var amount = (parseInt(e)*2) - 100
  //console.log("cont", amount)
  return amount
  //base.contrast(amount)

}

doBrightCont = function(){
  var bright = doBright($("#brightness_slider")[0].value)
  var cont = doCont($("#contrast_slider")[0].value)
  base.brightness_contrast(bright, cont)
}

startBright = function(){
  window.brightCircle = new Path.Circle(window.brightCirclePos, 10);
  window.brightCircle.fillColor = 'steelblue';
  window.brightCircle.onMouseDrag = doBright
}

endBright = function(){
  window.brightCircle.remove()
  window.brightCircle = null
}

hide = function(){
  all_rasters[1].visible = !all_rasters[1].visible
  if (all_rasters[1].visible){
    $("#show").show()
    $("#noshow").hide()
  }
  else{
    $("#noshow").show()
    $("#show").hide()
  }
}

dragHandler = function(e){
  /*
    What to do when the user drags based on the window.mode
  */

  if (e.event.button == 2){
    //right click and drag
    doPan(e)
    return
  }

  var me = this
  var mode = window.mode
  switch (mode) {
    case "paint":
      setPaintbrush("1")
      drawLine(e, me)
      break
    case "erase":
      setPaintbrush("0")
      drawLine(e, me)
      break
    case "zoom":
      doZoom(e)
      break
    case "view":
      doPan(e)
      break;

    default:
      break
  }
}

clickHandler = function(e){
  /*
    What to do when the user clicks based on window.mode
  */
 //console.log(e.event.button)



  var me = this
  var mode = window.mode
  switch (mode) {
    case "paintFill":
      setPaintbrush("1")
      doFloodFill(e, me)
      break;
    case "eraseFill":
      setPaintbrush("0")
      doFloodFill(e, me)
      break;
    case "brightness":
      doBright(e)
      break
    default:
      break

  }
}

mousedownHandler = function(e){
  /*
    What to do when the user mouses down based on window.mode
  */

  var me = this
  var mode = window.mode
  //console.log(e.event.button)
  if (e.event.button == 2){
    //right click and drag
    window.panMouseDown = e
  }

  switch (mode) {
    case "view":
      window.panMouseDown = e
      break;
    case "paint":
      setPaintbrush("1")
      break
    case "erase":
      setPaintbrush("0")
      break
    default:
      break

  }
}

function mousewheel( event ) {

  event.preventDefault();
  event.stopPropagation();
  event.delta = {}
  event.delta.y = event.deltaY
  doZoom(event)

}

onmousewheel = mousewheel

/* =============================================================================
                                    MAIN
==============================================================================*/



function start(base_url){

  var base = new Raster({
   crossOrigin: 'anonymous',
   source: base_url,
   position: view.center
  });

  base.onLoad = function() {
    //THIS ALWAYS RUNS -- will this break things??
    initialize_base_raster(base)

    //Load the (blank) ROI image
    var roi = new Raster({});
    initialize_roi_raster(base, roi)

    // ROI events
    roi.onMouseDrag = dragHandler
    roi.onMouseDown = mousedownHandler
    roi.onMouseUp = draw.reset
    roi.onClick = clickHandler

    // base events if ROI is hidden
    base.onClick = function(e){
      if (window.mode=="brightness"){
        doBright(e)
      }
    }

    //default mode:
    if (!window.mode){
      changeMode("paint")
    }
    //DEBUG: Set some global variables
    window.base = base
    window.roi = roi
    window.view = view
    //("#currentTool").html(window.mode)
    $(".mdl-layout__drawer-button").addClass("mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored")


  };
}

startProgress()
iOSLogin(function(){
  $.get("https://glacial-garden-24920.herokuapp.com/image?where=task==ms_lesion_t2&max_results=1&page=1", function(data, status, jqXhr){
    window.currentData = data
    var base_url = data._items[0].base_image_url
    var truth_data_url = data._items[0].truth_data
    window.collection_size = data._meta.total
    //Load the base image
    console.log("going to start")
    start(base_url)

  });
});

var stage = document.getElementById('myCanvas');
var mc = new Hammer.Manager(stage, {stopPropagation:true, preventDefault:true});
var Pinch = new Hammer.Pinch();

// add the recognizer
mc.add(Pinch);


window.prevZoom
var tmpzoom = 1

// subscribe to events
mc.on('pinch', function(e) {
    // do something cool

    if (e){
      if (window.mode == "view"){
        e.preventDefault()
        tmpzoom = xfm.clamp(e.scale/window.startScale*window.zoomFactor, 1, 5)
        view.setZoom(tmpzoom)
        //console.log("pinchin", e.scale)
        //var zf = e.scale/window.zoomFactor
        //window.zoomFactor = zf
        //view.setZoom(window.zoomFactor)
      }
    }

});

mc.on('pinchend', function(e) {
    // do something cool

    if (e){
      if (window.mode == "view"){
        e.preventDefault()

        window.zoomFactor = tmpzoom
        //var zf = e.scale/window.zoomFactor
        //window.zoomFactor = zf
        //view.setZoom(window.zoomFactor)
      }
    }

});

mc.on('pinchstart', function(e) {
    // do something cool

    if (e){
      if (window.mode == "view"){
        e.preventDefault()

        window.startScale = e.scale
        //var zf = e.scale/window.zoomFactor
        //window.zoomFactor = zf
        //view.setZoom(window.zoomFactor)
      }
    }

});


//start("images/brain.jpg")
