function getUserInfo(user_token, callback){
  /*

  Asks the server for user information based on a token from /authenticate/
  Inputs: user_token (string)
  callback: function to run after getting info. Takes 0 args

  This function updates the `app` variable, which is the main vue controller.
  (TODO: Maybe this should be passed in? or set in another callback?)

  */

  // for debugging:
  console.log("user token is", user_token)

  // AJAX settings for the call
  // TODO: removed hardcoded URL
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://api.medulina.com/api/v1/user?where=token%3D%3D%22"+user_token+"%22",
    "method": "GET",
    "headers": {
    },
    "processData": false,
    "contentType": false,
  }

  // for debugging, log the settings
  console.log("settings is", settings)

  // when the GET is done. set the app variables and run the callback
  $.get(settings).done(function(data){
    if (data._meta.total){
      console.log("found user in db", data)
      var score_info = data._items[0]
      console.log("score_info is", score_info)
      app.login.ave_score = score_info.ave_score;
      app.login.n_subs = score_info.n_subs;
      app.login.n_test = score_info.n_test;
      app.login.n_try = score_info.n_try;
      app.login.total_score = score_info.total_score;
      app.login.id = score_info._id;
      app.login.avatar = score_info.avatar;
      app.login.github_id = score_info.id;
      app.login.username = score_info.username;
      app.login.token = user_token;
      callback()

    } else {
      // if data is empty, pop up the login modal
      // TODO: for some reason this does not work.
      console.log("did not find data", data)
      store.clearAll()
      $('#loginModal').modal({
        backdrop: 'static',
        keyboard: false,
      });

    }
    stopProgress();
  });
}


var auth_url = {
  "medulina.com": "http://api.medulina.com/api/authenticate/github/",
  "localhost:8000": "http://api.medulina.com/api/authenticate/githublocal/"
}

function Login(callback) {
  /*
Starts the whole process

  */

  var profile = store.get('user_token');
  if (profile) {
    /*app.login.username = profile.login;
    app.login.avatar = profile.avatar_url;
    app.login.github_id = profile.id;*/
    console.log("profile exists")

    getUserInfo(profile, callback)


    //callback();
  } else {
    try {
      startProgress();
      var code = window.location.href.match(/\?code=(.*)/)[1];
      console.log("auth url is", auth_url[window.location.host]+ code)
      $.getJSON(auth_url[window.location.host]+ code, function (data) {
        console.log('data token is', data.token);
        getUserInfo(data.token, function (profile) {
          console.log("", profile);
          /*app.login.username = profile.login;
          app.login.avatar = profile.avatar_url;
          app.login.github_id = profile.id;*/

          if (history.pushState) {
            var newurl = window.location.protocol + '//' + window.location.host +
            window.location.pathname;
            window.history.pushState({ path: newurl }, '', newurl);
          };

          store.set('user_token', data.token);
          callback();
          //getUserInfo(profile, callback)


        });
      });

    } catch (e) {
      console.log("there was an error", e)
      $('#loginModal').modal({
        backdrop: 'static',
        keyboard: false,
      });
    }
  }

}

function logout() {
  store.clearAll();
  window.location.href = '/';
}
