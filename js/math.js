// Math

function _angle(a, b) {
    return Math.acos(_dot(a, b) / _module(a) / _module(b));
}

function _module(a) {
    return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
}

function _dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

function _add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}

function _diff(a, b) {
    return _add(a, _inverse(b));
}

function _mult(k, a) {
    return {
        x: k * a.x,
        y: k * a.y,
    };
}

function _inverse(a) {
    return {
        x: -a.x,
        y: -a.y,
    };
}

function _normalize(a) {
    return _mult(1 / _module(a), a);
}

function _line(a, b) {
    const d = _module(_diff(a, b));
    return !d ? [null, null, null] : [
        (b.y - a.y) / d,
        (a.x - b.x) / d,
        (-a.x * b.y + b.x * a.y) / d,
    ];
}

function _inline(p, A, B, C) {
    return p.x * A + p.y * B + C;
}

function _distance(p, A, B, C) {
    return Math.abs(_inline(p, A, B, C)) / Math.sqrt(A * A + B * B);
}
