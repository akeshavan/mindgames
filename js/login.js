function Login(callback) {
  //startProgress()

  var profile = store.get('github_profile');
  if (profile) {
    app.login.username = profile.login;
    app.login.avatar = profile.avatar_url;
    app.login.github_id = profile.id;
    callback();
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
          callback();
          stopProgress();
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
