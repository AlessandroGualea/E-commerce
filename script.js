const toggle = document.getElementById("toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => nav.classList.toggle("active"));
function scrollToTop() {
  window.scrollTo(0, 0);
}

const toggles = document.querySelectorAll(".faq-toggle");

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.parentNode.classList.toggle("active");
  });
});

const progressCircle = document.querySelector(".autoplay-progress svg");
const progressContent = document.querySelector(".autoplay-progress span");
var swiper = new Swiper(".mySwiper", {
  spaceBetween: 10,
  centeredSlides: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  on: {
    autoplayTimeLeft(s, time, progress) {
      progressCircle.style.setProperty("--progress", 1 - progress);
      progressContent.textContent = `${Math.ceil(time / 1000)}s`;
    }
  }
});


$(document).ready(function() {
  $('.quantita').on('input', function() {
    calcolaTotale();
  });

  $(document).on('click', '.rimuovi-prodotto', function() {
    $(this).closest('tr').remove();
    calcolaTotale();
  });

  function calcolaTotale() {
    var totale = 0;

    $('.quantita').each(function() {
      var quantita = parseInt($(this).val());
      var prezzo = parseInt($(this).closest('tr').find('td:nth-child(3)').text().replace('€', ''));
      totale += quantita * prezzo;
    });

    $('#totale').text('€' + totale);
  }
});





function accettaCookie() {
  document.getElementById("cookie-popup").style.display = "none";
}
