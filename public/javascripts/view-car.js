$(".slider").slick({
    dots: false,
    infinite: true,
    speed: 300,
    arrows: false,
    adaptiveHeight: true
});


function initMap() {
    var map, marker;
    var myLatlng = {
        lat: parseFloat($('#lat').text()),
        lng: parseFloat($('#lng').text())
    };

    // создание карты
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: myLatlng
    });

    // создание маркера
    marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable: false
    });

    map.panTo(myLatlng);
}