var tour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-arrows tourStyle'
  }
});


var tour_config = [
  {
    title: "Find the Dentate",
    text: `Brain researchers need your help to identify the dentate gyrus:
    <br>
    <br>
    <img src="https://cdn.rawgit.com/medulina/context/f48d59e5/DentateGyrusSurface_black.png" width="200px;" class="mx-auto d-block" style="border-radius: 5px; border-style: solid; border-color:black;">

    `,
    showCancelLink: true,
    attachTo: "nav top"
  },

  {
    title: "Find the Dentate",
    text: `On an MRI scan, it might look like:
    <br>
    <br>
    <img src="/images/example01.png" width="200px;" class="mx-auto d-block" style="border-radius: 5px; border-style: solid; border-color:black;">

    `,
    showCancelLink: true,
    attachTo: "nav top"
  },

  {
    title: "Find the Dentate",
    text: `On this slice, the dentate is shown in red
    <br>
    <br>
    <img src="/images/example01_answer.png" width="200px;" class="mx-auto d-block" style="border-radius: 5px; border-style: solid; border-color:black;">

    `,
    showCancelLink: true,
    attachTo: "nav top"
  },

  {
    title: "Find the Dentate",
    text: `On this slice, the dentate is shown in red
    <br>
    <br>
    <img src="/images/example02_context.png" width="200px;" class="mx-auto d-block" style="border-radius: 5px; border-style: solid; border-color:black;">

    `,
    showCancelLink: true,
    attachTo: "nav top"
  },

  {
    title: "Find the Dentate",
    text: `But the cross section of the dentate looks different at different sections.
    <br>
    <br>
    <img src="/images/example02.png" width="200px;" class="mx-auto d-block" style="border-radius: 5px; border-style: solid; border-color:black;">

    `,
    showCancelLink: true,
    attachTo: "legend right"
  },

]

tour_config.forEach(function(val, idx, arr){

  tour.addStep('Step'+idx, {
    title: val.title,
    text: val.text,
    //attachTo: '#menuButton bottom',
    //advanceOn: {selector: "#menuButton", event: "click"},
    showCancelLink: true,
    attachTo: val.attachTo
  });

})
