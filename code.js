(function() {

var firstRender = true;

function render() {
    function renderChilds(_, obj) {
        var $obj = $(obj);
        var th = $obj.height();
        var tw = $obj.width();
        var $childs = $(obj).children();

        // remove stray spaces cuz they will fuck up the layout
        if(firstRender) {
            $childs.remove();
            $obj.text('');
            $obj.append($childs);
        }

        if($obj.hasClass('wt-vertical')) {
            $childs.width(tw);
            $childs.each(function(i, child) {
                var $child = $(child);

                var height = Math.round(th / ($childs.length - i));
                th -= height;

                $child.height(height);
            });
        } else if($obj.hasClass('wt-horizontal') || $obj.hasClass('webtile')) {
            $childs.height(th);
            $childs.each(function(i, child) {
                var $child = $(child);

                var width = Math.round(tw / ($childs.length - i));
                tw -= width;

                $child.width(width);
            });
        }
    }
    $('.webtile').each(renderChilds);
    $('.wt-partition').each(renderChilds);
    firstRender = false;
}

gc();
render();
$('.webtile').css('visibility', 'visible');

var dragging = null;

$('.wt-title').mousedown(function(e) {
    var $target = $(e.target);

    dragging = {
        $target: $target.parent(),
        $copy: $target.parent().clone().css({
            opacity: .5,
            position: 'absolute',
            'border-width': '1px',
            top: e.pageY - e.offsetY,
            left: e.pageX - e.offsetX
        }).insertAfter('body'),
        x: e.offsetX,
        y: e.offsetY,
        moveto: null,
        windows: null
    };

    var $windows = $target.parentsUntil('.webtile').parent('.webtile').find('.wt-window');

    dragging.windows = [];
    $windows.each(function(_, win) {
        var $win = $(win);
        dragging.windows.push({
            $win: $win,
            x: $win.position().left,
            y: $win.position().top,
            width: $win.width(),
            height: $win.height()
        });
    });

    return false;
});

$(document).mouseup(function(e) {
    if(!dragging) {
        return;
    }

    dragging.$copy.remove();
    $('.wt-mask').remove();

    var $target = dragging.$target;

    if(!dragging.moveto) {
        dragging = null;
        return;
    }

    var $win = dragging.moveto.$win;
    var quad = dragging.moveto.quad;

    var pclass;
    if(quad === 'left' || quad === 'right') {
        pclass = 'wt-horizontal';
    } else {
        pclass = 'wt-vertical';
    }

    if($win.parent().hasClass(pclass)) {
        // add to current partition
        if(quad === 'top' || quad === 'left') {
            $target.insertBefore($win);
        } else {
            $target.insertAfter($win);
        }
    } else {
        // create new partition
        var $partition = $('<div/>', {
            class: 'wt-partition',
        });

        $partition.addClass(pclass);

        $partition.insertAfter($win);

        if(quad === 'top' || quad === 'left') {
            $win.appendTo($partition);
        }
        $target.appendTo($partition);
        if(quad === 'bottom' || quad === 'right') {
            $win.appendTo($partition);
        }
    }

    dragging = null;
    gc();
    render();
});

$(document).mousemove(function(e) {
    if(!dragging) {
        return;
    }

    var x = e.pageX;
    var y = e.pageY;

    dragging.$copy.css({
        top: y - dragging.y,
        left: x - dragging.x
    });

    dragging.moveto = null;
    $('.wt-mask').remove();

    var $win = whichWindow(x, y);

    if(!$win) {
        return false;
    }

    if($win[0] === dragging.$target[0]) {
        return false;
    }

    var quad = whichQuad(x, y, $win);
    if(!quad) {
        return false;
    }

    var height, width;
    var mx = 0;
    var my = 0;
    if(quad === 'bottom' || quad === 'top') {
        height = $win.height()/2;
        width = $win.width();
    } else if(quad === 'left' || quad === 'right') {
        height = $win.height();
        width = $win.width()/2;
    }

    if(quad === 'right') {
        mx = $win.width()/2;
    } else if(quad === 'bottom') {
        my = $win.height()/2;
    }

    $('<div/>', {
        class: 'wt-mask',
        css: {
            top: my,
            left: mx,
            height: height,
            width: width
        }
    }).appendTo($win);

    dragging.moveto = {
        $win: $win,
        quad: quad
    };

    return false;
});

function whichWindow(x, y) {
    var windows = dragging.windows;
    for(var i=0, l = windows.length; i < l; ++i) {
        var win = windows[i];
        if(x >= win.x && x <= win.x + win.width && y >= win.y && y <= win.y + win.height) {
            return win.$win;
        }
    }
}

function whichQuad(xa, ya, $win) {
    var x = xa - $win.position().left;
    var y = ya - $win.position().top;

    var ey1 = $win.height() / $win.width() * x;
    var ey2 = -$win.height() / $win.width() * x + $win.height();

    if(y > ey1 && y > ey2) {
        return 'bottom';
    } else if(y > ey1 && y < ey2) {
        return 'left';
    } else if(y < ey1 && y < ey2) {
        return 'top';
    } else if(y < ey1 && y > ey2) {
        return 'right';
    }
}

function gc() {
    $('.wt-partition').each(function(_, part) {
        var $part = $(part);
        var $childs = $part.children();

        if($childs.length === 0) {
            $part.remove();
        } else if($childs.length === 1) {
            $childs.first().insertAfter($part);
            $part.remove();
        }
    });
}

//*/

})();
