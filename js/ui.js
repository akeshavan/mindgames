$("#brightness_slider").change(function(e){
  //doBright(e.target.value)
  doBrightCont()
})
$("#contrast_slider").change(function(e){
  //doCont(e.target.value)
  doBrightCont()
})
$("#brightness_slider").on("mouseup",function(e){
  //doBright(e.target.value)
  doBrightCont()
})
$("#contrast_slider").on("mouseup",function(e){
  //doCont(e.target.value)
  doBrightCont()
})


function startProgress(){
  //var spot = $("#pbar")
  //spot.show()
  app.loading = true
}

function stopProgress(){
  //var spot = $("#pbar")
  //spot.hide()
  app.loading = false
}

function setMenuIcon(mode){

  var all_classnames = "mdi mdi-format-color-fill mdi-eraser-variant mdi-format-clear mdi-arrow-all"
  var component = $(".mdl-layout__header .mdl-layout__drawer-button i")
  component.removeClass(all_classnames)
  component.html("")

  switch (mode) {
    case "paint":
      component.html("brush")
      $("#zoompan").removeClass("mdl-button--primary")
      $("#zoompan").addClass("mdl-color--accent-contrast")
      break
    case "paintFill":
      component.addClass("mdi mdi-format-color-fill")
      $("#zoompan").removeClass("mdl-button--primary")
      $("#zoompan").addClass("mdl-color--accent-contrast")
      break
    case "erase":
      component.addClass("mdi mdi-eraser-variant")
      $("#zoompan").removeClass("mdl-button--primary")
      $("#zoompan").addClass("mdl-color--accent-contrast")
      break
    case "eraseFill":
      component.addClass("mdi mdi-format-clear")
      $("#zoompan").removeClass("mdl-button--primary")
      $("#zoompan").addClass("mdl-color--accent-contrast")
      break;
    case "view":
      component.html("open_with")
      $("#zoompan").removeClass("mdl-color--accent-contrast")
      $("#zoompan").addClass("mdl-button--primary")
      break;

    default:
      break
  }
}

blockContextMenu = function (evt) {
  evt.preventDefault();
};

myElement = $('#myCanvas').on('contextmenu', blockContextMenu);



show_eval = function(){
  //var output =  Mustache.render('<h4>Color the MS Lesions <button class="btn btn-primary btn-xsmall" onclick="do_eval()">Evaluate</button></h4>')
  //$("#submit_button").html("Submit")
  app.status = "Submit"
  $("#submit_button").prop("disabled",false);
  console.log("setting click to do_eval")
  //$("#submit_button").attr("onclick", "do_eval()")
  //$("#titlebar").html("Color the Lesions")
}

show_save = function(score){

  /*score["acc"] = score["accuracy"].toString()
  score["acc"] = score["acc"].slice(0,4)
  var snackbarContainer = document.querySelector('#demo-toast-example');
  var message = ""
  var message = score.xp > 0 ? '<i class="material-icons">add_circle</i>' : '<i class="material-icons">remove_circle</i>'
  message = message + Math.abs(score.xp)
  message = message + '<i class="material-icons" style="padding-left:1em;">gps_fixed</i>' + score.acc
  app.score.dice = score.acc
  app.score.points = score.xp

  //snackbarContainer.MaterialSnackbar.showSnackbar(data);
  $("#titlebar").html(message)
  //var output = Mustache.render('<h4> accuracy: {{acc}}, points: {{xp}} <button class="btn btn-success btn-xsmall" onclick="get_next()">Next</button> </h4>', score)
  //$("#submit_button").html("Next")
  */
  if (window.mode == "error"){
    app.score.points = "error"
    app.score.dice = "error"
  }
  app.status = "Next"

  console.log("setting click to get_next")
  //$("#submit_button").attr("onclick", "get_next()")
  $("#submit_button").prop("disabled",false);


}
