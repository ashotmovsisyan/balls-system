/**
 *
 * @param settings {{
 * lineThickness: Number,
 * velocity: Number,
 * fps: Number,
 * width: Number,
 * height: Number,
 * infectionTime: Number,
 * infectionProbability: Number,
 * ballSize: Number,
 * randomBallCount: Number,
 * container: HTMLElement,
 * walls: Array<Array<Number>>
 * balls: Array<Array<Number>>
 * }}
 * @constructor
 */
function System(settings) {
    let LINE_THICKNESS = settings.lineThickness || 5;
    const VELOCITY = settings.velocity || 150;
    const FPS = settings.fps || 24;
    const WIDTH = settings.width || 500;
    const HEIGHT = settings.height || 500;
    const INFECTION_TIME = settings.infectionTime || 5;
    const INFECTION_PROBABILITY = settings.infectionProbability || 1;
    const BALL_SIZE = settings.ballSize || 15;
    const RANDOM_BALL_COUNT = settings.randomBallCount || 0;

    settings.balls = settings.balls || [];
    settings.walls = settings.walls || [];

    const container = settings.container;

    container.style.width = WIDTH + "px";
    container.style.height = HEIGHT + "px";

    let t = 0;
    let collisionCount = 0;

    function Ball(x, y, v_x, v_y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.v = { x: v_x, y: v_y };
        this.health = 0;
        this.create();
        this.draw();
        Ball.instances.push(this);
    }

    Ball.instances = [];
    Ball.prototype.create = function () {
        this.element = document.createElement("div");
        this.element.classList.add("ball");

        container.appendChild(this.element);
    };
    Ball.prototype.draw = function () {
        this.element.style.top = this.y + "px";
        this.element.style.left = this.x + "px";
        this.element.style.borderRadius = this.r + "px";
        this.element.style.borderWidth = this.r + "px";

        if (this.health === 0) {
            if (!this.element.classList.contains("ball--gray")) {
                this.element.classList.add("ball--gray");
            }
            if (this.element.classList.contains("ball--red")) {
                this.element.classList.remove("ball--red");
            }

            if (this.element.classList.contains("ball--blue")) {
                this.element.classList.remove("ball--blue");
            }
        }

        if (this.health === 1) {
            if (!this.element.classList.contains("ball--red")) {
                this.element.classList.add("ball--red");
            }

            if (this.element.classList.contains("ball--gray")) {
                this.element.classList.remove("ball--gray");
            }

            if (this.element.classList.contains("ball--blue")) {
                this.element.classList.remove("ball--blue");
            }
        }

        if (this.health === 2) {
            if (!this.element.classList.contains("ball--blue")) {
                this.element.classList.add("ball--blue");
            }

            if (this.element.classList.contains("ball--gray")) {
                this.element.classList.remove("ball--gray");
            }

            if (this.element.classList.contains("ball--red")) {
                this.element.classList.remove("ball--red");
            }
        }
    };
    Ball.prototype.move = function (x, y) {
        this.x = x;
        this.y = y;

        this.draw();
    };
    Ball.prototype.infect = function () {
        if (this.health === 0) {
            this.health = 1;
            this.infectTime = t;
        }
    };
    Ball.prototype.getCollision = function (other) {
        const dot = _dot(_diff(this, other), _diff(this.v, other.v));
        const r = this.distance(other);
        const R = this.r + other.r;
        const v = _module(_diff(this.v, other.v));
        const alpha = Math.acos(-dot / r / v);
        if (alpha < 0.001) {
            return { time: (r - R) / v, distance: 0 };
        }
        if (alpha > Math.PI / 2) {
            return { time: -1, distance: r - R };
        }
        if (r <= R) {
            return { time: 0, distance: 0 };
        }
        if (r * Math.sin(alpha) > R) {
            return { time: r * Math.cos(alpha) / v, distance: r * Math.sin(alpha) - R };
        }
        return { time: R * Math.sin(Math.asin(r * Math.sin(alpha) / R) - alpha) / Math.sin(alpha) / v, distance: 0 };
    };
    Ball.prototype.distance = function (other) {
        return _module(_diff(this, other));
    };
    Ball.prototype.collide = function (other) {
        collisionCount++;
        const normal = _normalize(_diff(other, this));
        const vNormal = _dot(normal, _diff(other.v, this.v));
        this.v = _add(this.v, _mult(vNormal, normal));
        other.v = _diff(other.v, _mult(vNormal, normal));
    };
    Ball.prototype.destroy = function () {
        const index = Ball.instances.findIndex($ => $ === this);
        Ball.instances.splice(index, 1);
    };
    Ball.prototype.remove = function () {
        this.element.remove();
    };
    Ball.prototype.kill = function () {
        this.v = { x: 0, y: 0 };

        this.element.classList.remove("ball--red");
        this.element.classList.remove("ball--blue");
        this.element.classList.add("ball--black");

        this.destroy();
    };
    Ball.prototype.checkAnyCollision = function () {
        for (let i = 0; i < Ball.instances.length; i++) {
            if (this === Ball.instances[i]) {
                continue;
            }

            if (this.distance(Ball.instances[i]) < this.r + Ball.instances[i].r) {
                return true;
            }
        }

        for (let i = 0; i < Point.instances.length; i++) {
            if (this.distance(Point.instances[i]) < this.r + LINE_THICKNESS) {
                return true;
            }
        }

        for (let i = 0; i < Wall.instances.length; i++) {
            const wall = Wall.instances[i];
            if (Math.abs(_inline(this, wall.A, wall.B, wall.C)) < LINE_THICKNESS + this.r) {
                return true;
            }
        }
        return false;
    };

    Ball.checkHealth = function () {
        Ball.instances.forEach(_ => {
            if (_.health !== 1) {
                return;
            }
            if ((t - _.infectTime) > INFECTION_TIME) {
                _.health = 2;
            }
        });
    };


    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.create();
        this.draw();
        Point.instances.push(this);
    }

    Point.instances = [];
    Point.prototype.create = function () {
        this.element = document.createElement("div");
        this.element.classList.add("point");

        container.appendChild(this.element);
    };
    Point.prototype.draw = function () {
        this.element.style.top = this.y + "px";
        this.element.style.left = this.x + "px";
        this.element.style.borderRadius = LINE_THICKNESS + "px";
        this.element.style.borderWidth = LINE_THICKNESS + "px";
    };
    Point.prototype.distance = function (other) {
        return _module(_diff(this, other));
    };
    Point.prototype.getCollision = function (ball) {
        const dot = _dot(_diff(ball, this), ball.v);
        const r = this.distance(ball);
        const R = (LINE_THICKNESS + ball.r);
        const v = _module(ball.v);
        const alpha = Math.acos(-dot / r / v);

        if (alpha < 0.001) {
            return { time: (r - R) / v, distance: 0 };
        }

        if (alpha > Math.PI / 2) {
            return { time: -1, distance: r - R };
        }

        if (r <= R) {
            return { time: 0, distance: 0 };
        }

        if (r * Math.sin(alpha) > R) {
            return { time: r * Math.cos(alpha) / v, distance: r * Math.sin(alpha) - R };
        }

        return { time: R * Math.sin(Math.asin(r * Math.sin(alpha) / R) - alpha) / Math.sin(alpha) / v, distance: 0 };
    };
    Point.prototype.collide = function (ball) {
        const normal = _normalize(_diff(this, ball));
        const vNormal = _dot(normal, ball.v);
        ball.v = _diff(ball.v, _mult(2 * vNormal, normal));
    };
    Point.prototype.remove = function () {
        this.element.remove();
    }

    function Wall(s, e) {
        this.points = [s, e];
        this.calc();
        this.create();
        this.draw();
        Wall.instances.push(this);
    }

    Wall.instances = [];
    Wall.prototype.calc = function () {
        const [p1, p2] = this.points;
        this.distance = p1.distance(p2);
        const [A, B, C] = _line(p1, p2);
        this.A = A;
        this.B = B;
        this.C = C;
    };
    Wall.prototype.create = function () {
        this.element = document.createElement("div");
        this.element.classList.add("line");
        container.appendChild(this.element);
    };
    Wall.prototype.draw = function () {
        this.element.style.width = (this.distance - 2 * LINE_THICKNESS) + "px";
        const [p1, p2] = this.points;
        const d = _normalize(_diff(p1, p2));
        this.element.style.top = p1.y + "px";
        this.element.style.left = p1.x + "px";
        this.element.style.borderWidth = LINE_THICKNESS + "px";
        this.element.style.transform = `translate(0,-50%) matrix(${-d.x},${-d.y},${d.y},${-d.x},0,0)`;
    };
    Wall.prototype.getCollision = function (ball) {
        const [p1, p2] = this.points;
        const { distance, A, B, C } = this;

        if (distance === 0) {
            return { time: -1, distance: -1 };
        }
        const D = _inline(ball, A, B, C);

        if (Math.abs(D) < LINE_THICKNESS + ball.r) {
            return { time: -1, distance: -2 };
        }


        const s1 = _add(p1, _mult(Math.sign(D) * (LINE_THICKNESS + ball.r), { x: A, y: B }));
        const s2 = _add(p2, _mult(Math.sign(D) * (LINE_THICKNESS + ball.r), { x: A, y: B }));

        if (_module(ball.v) === 0) {
            return { time: -1, distance: -1 };
        }

        const [ballA, ballB, ballC] = _line(ball, _add(ball, ball.v));


        if (Math.sign(_inline(s1, ballA, ballB, ballC)) === Math.sign(_inline(s2, ballA, ballB, ballC))) {
            return { time: -1, distance: -1 };
        }

        const [sA, sB, sC] = _line(s1, s2);


        if (Math.sign(_inline(ball, A, B, C)) === Math.sign(_dot(ball.v, { x: A, y: B }))) {

            return { time: -1, distance: -1 };
        }

        return { time: _distance(ball, sA, sB, sC) / Math.abs(_dot(ball.v, { x: sA, y: sB })), distance: 0 };
    };
    Wall.prototype.collide = function (ball) {
        const normal = { x: this.A, y: this.B };
        const vNormal = _dot(normal, ball.v);
        ball.v = _diff(ball.v, _mult(2 * vNormal, normal));

    };
    Wall.prototype.remove = function () {
        this.element.remove();
    }


    const points = [
        new Point(0, 0),
        new Point(WIDTH, 0),
        new Point(WIDTH, HEIGHT),
        new Point(0, HEIGHT),
    ];

    new Wall(points[0], points[1]);
    new Wall(points[1], points[2]);
    new Wall(points[2], points[3]);
    new Wall(points[3], points[0]);


    for (let i = 0; i < settings.walls.length; i++) {
        const [x1, y1, x2, y2] = settings.walls[i];
        new Wall(new Point(x1, y1), new Point(x2, y2));
    }

    for (let i = 0; i < settings.balls.length; i++) {
        const [x, y, vx, vy, size] = settings.balls[i];
        const ball = new Ball(x, y, vx, vy, size || BALL_SIZE);
        if (ball.checkAnyCollision()) {
            ball.kill();
        }
    }

    generate();

    while (RANDOM_BALL_COUNT && Ball.instances[0].health === 0) {
        Ball.instances[0].infect();
    }

    function nextCollision() {
        const collisions = [];
        for (let i = 0; i < Ball.instances.length; i++) {
            const item = Ball.instances[i];

            for (let j = i + 1; j < Ball.instances.length; j++) {
                const other = Ball.instances[j];

                const { time, distance } = item.getCollision(other);
                if (time >= 0 && distance === 0) {
                    collisions.push({
                        type: "items",
                        time,
                        items: [item, other]
                    });
                }
            }
            for (let j = 0; j < Point.instances.length; j++) {
                const point = Point.instances[j];

                const { time, distance } = point.getCollision(item);
                if (time >= 0 && distance === 0) {
                    collisions.push({
                        type: "point",
                        time,
                        items: [item, point]
                    });
                }
            }
            for (let j = 0; j < Wall.instances.length; j++) {
                const wall = Wall.instances[j];
                const { time, distance } = wall.getCollision(item);
                if (time >= 0 && distance === 0) {
                    collisions.push({
                        type: "wall",
                        time,
                        items: [item, wall]
                    });
                }
            }
        }
        let min = collisions[0];
        for (const collision of collisions) {
            if (min.time > collision.time) {
                min = collision;
            }
        }
        return min;
    }

    function update(dt) {
        for (const item of Ball.instances) {
            item.move(
                item.x + item.v.x * dt,
                item.y + item.v.y * dt
            );
        }
    }


    let collision = null;
    let pause = true;
    next();
    const history = [];


    function next() {
        if (pause) {
            return;
        }
        if (!collision) {
            collision = nextCollision();
        }

        const collide = collision.time < 1 / FPS;
        let dt = collide ? collision.time : 1 / FPS;

        setTimeout(() => {
            t += dt;
            Ball.checkHealth();
            update(dt);

            if (collide) {
                switch (collision.type) {
                    case "right-wall":
                    case "left-wall":
                        collision.items[0].v.x =
                            -collision.items[0].v.x;
                        break;
                    case "bottom-wall":
                    case "top-wall":
                        collision.items[0].v.y =
                            -collision.items[0].v.y;
                        break;
                    case "items": {
                        const [a, b] = collision.items;
                        a.collide(b);

                        if (a.health === 1 || b.health === 1) {
                            a.infect();
                            b.infect();
                        }
                        break;
                    }
                    case "point":
                    case "wall": {
                        const [a, b] = collision.items;
                        b.collide(a);
                        break;
                    }

                    default:
                        break;
                }

                history.push({
                    time: t,
                    balance: Ball.instances.reduce((a, c) => {
                        a[c.health] = a[c.health] + 1;
                        return a;
                    }, [0, 0, 0]),
                    count: collisionCount,
                });

                collision = null;
            } else {
                collision.time -= 1 / FPS;
            }


            next();
        }, 500 * dt);
    }

    function generate() {
        let phi = 0;
        let size = 0;
        let x = 0;
        let y = 0;
        let t = 0;
        for (let i = 0; i < RANDOM_BALL_COUNT; i++) {
            phi = 2 * Math.PI * Math.random();
            size = BALL_SIZE;
            x = LINE_THICKNESS + size + Math.random() * (WIDTH - 2 * LINE_THICKNESS - 2 * size);
            y = LINE_THICKNESS + size + Math.random() * (HEIGHT - 2 * LINE_THICKNESS - 2 * size);
            const ball = new Ball(
                x, y,
                VELOCITY * Math.sin(phi),
                VELOCITY * Math.cos(phi),
                size
            );
            if (ball.checkAnyCollision()) {
                ball.destroy();
                ball.remove();
                i--;
                t++;
                if (t > RANDOM_BALL_COUNT * 2) {
                    break;
                }
            }
        }
    }

    this.start = () => {
        if (pause) {
            pause = false;
            next();
        }
    };

    this.pause = () => {
        pause = true;
    };

    this.delete = () => {
        this.pause();
        Ball.instances.forEach(_ => _.remove());
        Wall.instances.forEach(_ => _.remove());
        Point.instances.forEach(_ => _.remove());
        Ball.instances = [];
        Wall.instances = [];
        Point.instances = [];
    }

    this.setLineThickness = (value) => {
        LINE_THICKNESS = value;
        Ball.instances.forEach(_ => _.remove());
        Ball.instances = [];
        Point.instances.forEach(_ => _.draw());
        Wall.instances.forEach(_ => _.draw());
    }
}
