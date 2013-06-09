App.service('Utils', ['$http', '$location', function($http, $location){
    return {
        millisecondsToStr: function(t){
            var cd = 24 * 60 * 60 * 1000, ch = 60 * 60 * 1000, d = Math.floor(t / cd), h = '0' + Math.floor((t - d * cd) / ch), m = '0' + Math.round((t - d * cd - h * ch) / 60000);
            return [(d + ' ' + I8n.days), (h.substr(-2) + ' ' + I8n.hours), (m.substr(-2)+ ' ' + I8n.minutes)].join(', ');
        },
        millisecondsToDate: function(t){
            if(t != null){
                var date = new Date(t);
                return date.toString();
            }
        }
    }
}
]);
