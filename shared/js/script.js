// mobile hamburger menu 
document.getElementById("hamburger-menu-icon").addEventListener('click', function() {
    var hiddenMenu = document.getElementById("hamburger-menu");
    var menuIcon = document.getElementById('hamburger-icon')
    if (hiddenMenu.style.display === "block") {
      hiddenMenu.style.display = "none";
      menuIcon.style.color = "#fffffe"
    } else {
      hiddenMenu.style.display = "block";
      menuIcon.style.color = "#2cb67d"
    }
});