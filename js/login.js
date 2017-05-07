function Login(callback){
//startProgress()
var profile = store.get("github_profile")
currentData = null
if (profile){
  var output = Mustache.render('<img class="demo-avatar" src="{{avatar_url}}"/>', profile)
  $("#login_info").html(output)
  $("#login_name").html(profile.login)
  callback()
  //stopProgress()
}
else{
  try {
    startProgress()
    var code = window.location.href.match(/\?code=(.*)/)[1];
    $.getJSON('https://aqueous-reef-70776.herokuapp.com/authenticate/'+code, function(data) {
      console.log("data token is", data.token);
      getProfile(data.token, function(profile){
        console.log(profile)
        var output = Mustache.render('<img class="demo-avatar" src="{{avatar_url}}"/>', profile)
        $("#login_info").html(output)
        $("#login_name").html(profile.login)

        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newurl},'',newurl);
        }
        store.set("github_profile", profile)
        callback()
        stopProgress()
      })
    });

  } catch (e) {
    var dialog = document.querySelector('#modal-example');
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal()
  }
}

function getProfile (token, callback) {
  var options = {
    url: 'https://api.github.com/user',
    json: true,
    headers: {
      authorization: 'token ' + token
    }
  }
  console.log("going to call AJAX")
  $.ajax({
      url: 'https://api.github.com/user',
      headers: {
        authorization: 'token ' + token
      },
      success: function(data, status, jqxhr){
        callback(data)
      }
  });

}
}

function logout(){
  store.clearAll()
  console.log("logging out")
  window.location.href = '/';
}
