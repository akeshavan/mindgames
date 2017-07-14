var tour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-arrows tourStyle'
  }
});

tour.addStep('Welcome', {
  title: 'Welcome',
  text: 'Brain researchers need YOUR help, to identify different parts of the brain',
  //attachTo: '#menuButton bottom',
  //advanceOn: {selector: "#menuButton", event: "click"},
  showCancelLink: true
});

tour.addStep('MSIntro', {
  title: 'Multiple Sclerosis',
  text: `Multiple sclerosis is a neurlogical disorder that affects a person's ability to walk, see, and think.
  <br><br>
  In this game, we need you to <b>identify multiple sclerosis lesions</b>`,
  //attachTo: '#menuButton bottom',
  //advanceOn: {selector: "#menuButton", event: "click"},
  showCancelLink: true
});

tour.addStep('MSColor', {
  title: 'Color the lesions',
  text: `
  You can color the lesions by <b>clicking and dragging</b> on the MRI image below.
  <br><br>
  You can zoom by <b>pinching or scrolling</b>
  <br><br>
  And pan with a <b> right-click and drag, or two finger drag</b>
  `,
  //attachTo: '#menuButton bottom',
  //advanceOn: {selector: "#menuButton", event: "click"},
  showCancelLink: true
});

tour.addStep('Fill', {
  title: 'Fill with a double tap/click',
  text: `
  You can outline a lesion and then <b>double-tap or click</b> within the shape to fill it.
  <br>
  <br>
  Make sure the shape is closed, otherwise you will get an error!
  `,
  //attachTo: '#menuButton bottom',
  //advanceOn: {selector: "#menuButton", event: "click"},
  showCancelLink: true
});

tour.addStep('menuButton', {
  title: 'Toggle the Menu',
  text: 'Click or tap this button to toggle the menu. You can change brush size, brush color, brightness and contrast.',
  attachTo: '#menuButton bottom',
  advanceOn: {selector: "#menuButton", event: "click"},
  showCancelLink: true
});

tour.addStep('toggleButton', {
  title: 'Toggle the Drawing',
  text: 'Click or tap this button to toggle the drawing. This is useful when you want to see the image underneath your drawing more clearly.',
  attachTo: '#toggleButton top',
  advanceOn: {selector: "#toggleButton", event: "click"},
  showCancelLink: true
});

tour.addStep('undoButton', {
  title: 'Undo',
  text: 'Click or tap this button to undo your last action. Be careful, you cannot redo!',
  attachTo: '#undoButton bottom',
  advanceOn: {selector: "#undoButton", event: "click"},
  showCancelLink: true
});

tour.addStep('brushSize', {
  title: 'Change the brush size',
  text: 'Click or tap this button to open the brush size menu. Use the slider to choose the brush size',
  attachTo: '#brushSize bottom',
  advanceOn: {selector: "#brushSize", event: "click"},
  showCancelLink: true,
  when: {
    "before-show": function(){
      console.log("before show")
      app.show = true;
    }
  }
});

tour.addStep('brushColor', {
  title: 'Change the brush color',
  text: 'Click or tap this button to change the brush color.',
  attachTo: '#brushColor bottom',
  advanceOn: {selector: "#brushColor", event: "click"},
  showCancelLink: true,
});

tour.addStep('brightness', {
  title: 'Change the brightness',
  text: 'Click or tap this button to change the brightness.',
  attachTo: '#brightness bottom',
  advanceOn: {selector: "#brightness", event: "click"},
  showCancelLink: true,
});

tour.addStep('contrast', {
  title: 'Change the contrast',
  text: 'Click or tap this button to change the contrast.',
  attachTo: '#contrast bottom',
  advanceOn: {selector: "#contrast", event: "click"},
  showCancelLink: true,
});

tour.addStep('submit', {
  title: 'Submit',
  text: 'When you are done, submit your drawing for evaluation. You will get a score and feedback on your accuracy',
  attachTo: '.submitButton bottom',
  advanceOn: {selector: "#contrast", event: "click"},
  showCancelLink: true,
});
