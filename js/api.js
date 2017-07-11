config = {
  image_url: 'http://54.211.41.50/api/v1/image?max_results=1&page=', //'https://glacial-garden-24920.herokuapp.com/image?where=task==ms_lesion_t2&max_results=1&page=',
  edit_url: 'https://glacial-garden-24920.herokuapp.com/edits',
  player_url: 'https://glacial-garden-24920.herokuapp.com/player'
}


get_url = function(random){
  return config.image_url + random
}

do_eval = function(){
  console.log('DOING EVAL\n\n')
  startProgress()
  $('#submit_button').prop('disabled',true);
  var data = window.currentData
  $.getJSON(data._items[0].truth_data, function(truth){
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
  })
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

function create_json_request(data, url){

  var settings = {
    'async': true,
    'crossDomain': true,
    'url': url,
    'method': 'POST',
    'headers': {
      'content-type': 'application/json',
      'cache-control': 'no-cache',
    },
    'processData': false,
    'data': JSON.stringify(data)
  }

  return settings

}

do_save = function(score, edits){
  startProgress()
  var imgbody = {
    'image_id': [window.currentData._items[0]._id],
    'edit_data': edits,
    'player_id': score['name']
  }

  var settings = create_request(imgbody, config.edit_url)

  $.ajax(settings).done(function(response){console.log(response)})

  var scoresettings = create_json_request(score, config.player_url)
  $.ajax(scoresettings).done(function(response){
    console.log(response)
    stopProgress()
    show_save(score)
  })

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
