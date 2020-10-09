

  var icon = document.getElementsByClassName('navbar-brand')[0];
  icon.onclick = ()=>{
    console.log('clicked');
    location.href='/'
  };

  function renderImg(){
    var x = document.getElementById("createEventImg");
    x.style.display = "block";
    console.log(x.style);
  }
