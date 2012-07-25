(function() {

function render() {
    $('.wt-partition').each(function(_, obj) {
        var $obj = $(obj);
        var th = $obj.height();
        var tw = $obj.width();
        var $childs = $(obj).children();

        // remove stray spaces cuz they will fuck up the layout
        $childs.remove();
        $obj.text('');
        $obj.append($childs);

        if($obj.hasClass('wt-vertical')) {
            $childs.width(tw);
            $childs.each(function(i, child) {
                var $child = $(child);

                var height = Math.round(th / ($childs.length - i));
                th -= height;

                $child.height(height);
            });
        } else if($obj.hasClass('wt-horizontal')) {
            $childs.height(th);
            $childs.each(function(i, child) {
                var $child = $(child);

                var width = Math.round(tw / ($childs.length - i));
                tw -= width;

                $child.width(width);
            });
        }
    });
}

render();
$('.webtile').css('visibility', 'visible');

})();
