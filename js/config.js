var auth_id = {
  "dg.medulina.com": "d0dee0089411bc5134ae",
  "localhost:8000": "f586bf4498f82125fc48",
  "test.medulina.com": "7a33c7349ef2968b7480",
  "stroke.medulina.com": "3e15212f1b51861a9b2c",
  "tumor.medulina.com": "d0df9c1af2484144b134"
}

var auth_url = {
  "dg.medulina.com": "http://api.medulina.com/api/authenticate/dg/github/",
  "localhost:8000": "http://api.medulina.com/api/authenticate/githublocal/",
  "test.medulina.com": "http://testapi.medulina.com/api/authenticate/githubtest/",
  "stroke.medulina.com": "http://api.medulina.com/api/authenticate/stroke/github/",
  "tumor.medulina.com": "http://api.medulina.com/api/authenticate/tumor/github/"
}

var task_dict = {
  "stroke.medulina.com": "atlas_lesions",
  "tumor.medulina.com": "tumor001_fixed",
  "dg.medulina.com": "db_cor_context03",
}

var title_dict = {
  "stroke.medulina.com": "Stroke",
  "tumor.medulina.com": "Meningioma",
  "dg.medulina.com": "Dentate Gyrus",
}

var context_dict = {
  "stroke.medulina.com": false,
  "tumor.medulina.com": false,
  "dg.medulina.com": true,
}



config = {
  mask_url: 'http://api.medulina.com/api/v1/mask',
  image_url: 'http://api.medulina.com/api/v1/image/',
  player_url: 'http://api.medulina.com/api/v1/user/',
  edit_url: 'http://api.medulina.com/api/v1/mask',
  use_random: false,
  task: task_dict[window.location.host],
  num: 15,
  total_num_images: 50,
  title: title_dict[window.location.host],
  context: context_dict[window.location.host]
}

if (window.location.host == "test.medulina.com"){
  console.log("USING TEST CONFIG")
  config = {
    mask_url: 'http://testapi.medulina.com/api/v1/mask',
    image_url: 'http://testapi.medulina.com/api/v1/image/',
    player_url: 'http://testapi.medulina.com/api/v1/user',
    edit_url: 'http://testapi.medulina.com/api/v1/mask',
    use_random: false,
    task: "atlas_lesions",
    num: 15,
    total_num_images: 50,
  }
}
