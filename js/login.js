function postToDB(profile, callback){
  var token = "NnrP65CXaSnZ0aLPZ8Ox64d0pDlSKS0R8wpymwLr";
  var data = {username: profile.login,
              avatar: profile.avatar_url,
              oa_id: profile.id}

  var form = new FormData();
  form.append("oa_id", profile.id);
  form.append("avatar", profile.avatar_url);
  form.append("username", profile.login);

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://54.211.41.50/api/v1/user/",
    "method": "POST",
    "headers": {
      "authorization": token,
    },
    "processData": false,
    "contentType": false,
    "mimeType": "multipart/form-data",
    "data": form
  }

  console.log("sending settings...", settings)
  settings.success = function(data, status, jqxhr){
    console.log("success in POST!", data, status)
    callback()
  }
  var output = $.ajax(settings)
  console.log(output)
}

function getUserInfo(profile, callback){

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://54.211.41.50/api/v1/user?where=username%3D%3D%22"+profile.login+"%22",
    "method": "GET",
    "headers": {
    },
    "processData": false,
    "contentType": false,
  }

  $.get(settings).done(function(data){
    if (data._meta.total){
      console.log("found user in db", data)
      var score_info = data._items[0]
      app.login.ave_score = score_info.ave_score;
      app.login.n_subs = score_info.n_subs;
      app.login.n_test = score_info.n_test;
      app.login.n_try = score_info.n_try;
      app.login.total_score = score_info.total_score;
      app.login.id = score_info._id
      callback()

    } else {
      console.log("did not find data", data)
      postToDB(profile, callback)

    }
    stopProgress();
  });
}

function Login(callback) {
  //startProgress()

  var profile = store.get('github_profile');
  if (profile) {
    app.login.username = profile.login;
    app.login.avatar = profile.avatar_url;
    app.login.github_id = profile.id;

    getUserInfo(profile, callback)


    //callback();
  } else {
    try {
      startProgress();
      var code = window.location.href.match(/\?code=(.*)/)[1];
      $.getJSON('https://aqueous-reef-70776.herokuapp.com/authenticate/' + code, function (data) {
        console.log('data token is', data.token);
        getProfile(data.token, function (profile) {
          console.log(profile);
          app.login.username = profile.login;
          app.login.avatar = profile.avatar_url;
          app.login.github_id = profile.id;

          if (history.pushState) {
            var newurl = window.location.protocol + '//' + window.location.host +
            window.location.pathname;
            window.history.pushState({ path: newurl }, '', newurl);
          };

          store.set('github_profile', profile);
          //callback();
          getUserInfo(profile, callback)

        });
      });

    } catch (e) {
      $('#loginModal').modal({
        backdrop: 'static',
        keyboard: false,
      });
    }
  }

  function getProfile(token, callback) {
    var options = {
      url: 'https://api.github.com/user',
      json: true,
      headers: {
        authorization: 'token ' + token,
      },
    };

    $.ajax({
      url: 'https://api.github.com/user',
      headers: {
        authorization: 'token ' + token,
      },
      success: function (data, status, jqxhr) {
        callback(data);
      },
    });

  }
}

function logout() {
  store.clearAll();
  window.location.href = '/';
}
