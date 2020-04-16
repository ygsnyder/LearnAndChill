var aboutOverlay = document.getElementsByClassName('banner__logo')[0];
aboutOverlay.addEventListener('click', function (event) {
    location.href = "/";
  });


var minimumHeight = document.getElementsByTagName('html')[0].offsetHeight;
console.log(minimumHeight);
document.getElementsByTagName('body')[0].setAttribute('style', 'min-height: ${minimumHeight}');