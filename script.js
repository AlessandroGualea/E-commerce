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

function aggiungiAlCarrello() {
  var carrello = document.getElementById("carrello");
  var numero = parseInt(carrello.innerHTML);
  numero++;
  carrello.innerHTML = numero;
}
function rimuoviDalCarrello() {
  var carrello = document.getElementById("carrello");
  var numero = parseInt(carrello.innerHTML);
  numero--;
  carrello.innerHTML = numero;
}
function svuotaCarrello() {
  var carrello = document.getElementById("carrello");
  carrello.innerHTML = 0;
}






'use strict';

var app = angular.module('app', []);

app.controller('CartCtrl', ['$scope', function($scope) {
    $scope.items = [
       {
         name: 'A',
         price: 5,
         qty: 1
       },
      {
        name: 'B',
        price: 2,
        qty: 1
      },
      {
        name: 'C',
        price: 3,
        qty: 1
      }
    ];
  
    $scope.total = 0;
  
    $scope.getTotal = function() {
        $scope.total = 0;
        $scope.items.forEach(function(item) {
            var qty = parseInt(item.qty, 10);
            if(!item.qty || qty === 0) {
              qty = 1;
            }
            $scope.total += (qty * item.price);
        });
    };
  
    $scope.getTotal();
}]);
