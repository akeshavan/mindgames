config = {
  image_url: 'http://54.211.41.50/api/v1/image?max_results=1&page=', //'https://glacial-garden-24920.herokuapp.com/image?where=task==ms_lesion_t2&max_results=1&page=',
  edit_url: 'https://glacial-garden-24920.herokuapp.com/edits',
  player_url: 'https://glacial-garden-24920.herokuapp.com/player'
}

config = {
  mask_url: 'http://54.211.41.50/api/v1/mask?mode=truth&max_results=1&page=',
  image_url: 'http://54.211.41.50/api/v1/image/',
  player_url: 'http://54.211.41.50/api/v1/user/',
  edit_url: 'http://54.211.41.50/api/v1/mask'
}

get_url = function(random){
  return config.mask_url + random
}

do_eval = function(){
  console.log('DOING EVAL\n\n')
  startProgress()
  $('#submit_button').prop('disabled',true);
  var data = window.currentData
  var truth = window.truthData
  //$.getJSON(data._items[0].truth_data, function(truth){
    var cscore_and_diff = roi.diff(truth)
    var cscore = cscore_and_diff[0]
    var diffvals = cscore_and_diff[1]
    window.diffvals = diffvals
    var profile = store.get('github_profile')
    var score = {'name': profile.login, 'edit_data_id': data._items[0]._id}
    score['xp'] = cscore.tp - cscore.fn - cscore.fp
    score['accuracy'] = 2* cscore.tp/(2* cscore.tp + cscore.fn + cscore.fp) //this is the dice coefficient
    console.log('score is', score)
    stopProgress()
    do_save(score, JSON.stringify(diffvals))
  //})
}

function create_request(data, url){
  var form = new FormData();
  for (key in data){
    form.append(key, data[key])
  }
  var settings = {
    'async': true,
    'crossDomain': true,
    'url': url,
    'method': 'POST',
    'headers': {
      'cache-control': 'no-cache'
    },
    'processData': false,
    'contentType': false,
    'mimeType': 'multipart/form-data',
    'data': form
  }

  return settings
}

function create_json_request(data, url, auth){

  var settings = {
    'async': true,
    'crossDomain': true,
    'url': url,
    'method': 'POST',
    'headers': {
    },
    'processData': false,
    'data': JSON.stringify(data)
  }

  if (auth){
    settings.headers["authorization"] = auth
  }

  return settings

}

do_save = function(score, edits){
  startProgress()
  var imgbody = {
    'image_id': [window.currentData._items[0].image_id],
    'pic': edits,
    'mode': 'try',
    'score': score.accuracy,
    'user_id': app.id //score['name']
  }
  var token = "NnrP65CXaSnZ0aLPZ8Ox64d0pDlSKS0R8wpymwLr";
  var settings = create_json_request(imgbody, config.edit_url, token)
  console.log("settings are", settings)
  $.ajax(settings).done(function(response){console.log("POSTed", response)})

  //TODO: send a GET to /user/{userID}

}

get_next = function(){
  var page = getRandomInt(1,collection_size)
  console.log('next page is', page)
  $('#submit_button').prop('disabled',true);
  startProgress()
  $.get(get_url(page), function(data, status, jqXhr){
    view.setZoom(1)

    base.setSource('data:image/jpeg;base64,'+data._items[0].pic)
    var answer = data._items[0].truth_data
    roi.clear()
    draw.history = [[]]
    window.zoomFactor = 1
    window.panFactor = {x:0, y:0}
    window.currentData = data

    show_eval()

  })
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
