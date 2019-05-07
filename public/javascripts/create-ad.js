function updateCoordinates(lat, lng) {
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
}

// работа с картой
function initMap() {
    var map, marker;
    var myLatlng = {
        lat: 46.4552589061551,
        lng: 30.729185977478892
    };

    // создание карты
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: myLatlng
    });

    // создание маркера
    marker = new google.maps.Marker({
        map: map,
        draggable: false
    });

    // при клике на карту устанавливаем маркер в место клика и записываем координаты в input
    map.addListener('click', function(e) {
        marker.setPosition(e.latLng);
        updateCoordinates(e.latLng.lat(), e.latLng.lng());
    });

    map.panTo(myLatlng);
}

// проверка поставил ли пользователь отметку на карте
function checkCoordinates(){
    if ($('#lat').val() == '' || $('#lng').val() == ''){

        // показываем сообщение с просьбой поставить отметку
        $('.no-coordinates-warn').removeClass('hidden');
        return false;
    }
    return true;
}
