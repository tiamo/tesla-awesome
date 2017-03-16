/**
 * Copyright MAGNETIC IP, OU.
 * @author github.com/tiamo (TeslaAmazing team)
 * @since 2015
 */
(function ($, undefined) {

    "use strict";

    if (!window.PIXI) throw 'PIXI required.';
    if (!window.TA) throw 'TA required.';

    var moduleName = 'TeslaAwesome',

    base = {
        debug: false,
        width: 1920,
        height: 1080,
        assets: []
    };

    base.opts = {
        topOffsetRate: 0.1428,
        preloaderSpeed: 1.1,
        preloaderTextStyle: {
            font: '24px Halvetica',
            fill: '#d8e2ff',
            width: 100
        },
        dustAlphaSpeed: 0.005,
        dust: {
            spriteFunction: function () {
                //noinspection JSUnresolvedVariable
                return new PIXI.Sprite(base.loader.resources.particle.texture);
            },
            count: 130,
            minSize: 1.5,
            maxSize: 6,
            minAlpha: 0.1,
            maxAlpha: 0.5,
            minAlphaSpeed: 0.0001,
            maxAlphaSpeed: 0.002,
            mouseReact: -10.7,
            x: base.width / 4,
            width: base.width / 2,
            height: base.height / 2
        },
        magicAlphaSpeed: 0.005,
        magic: {
            spriteFunction: function () {
                return new PIXI.Sprite(base.loader.resources.magic.texture);
            },
            count: 80,
            minSize: 1.2,
            maxSize: 3.8,
            minAlpha: 0,
            maxAlpha: 0.3,
            minAlphaSpeed: 0.001,
            maxAlphaSpeed: 0.04,
            x: base.width / 2 - 150,
            y: base.height / 2 + 170,
            width: 400,
            height: 250
        },
        teslaAlphaSpeed: 0.04
    };

    /**
     * debug tool
     */
    base.trace = function () {
        if (this.debug && console) {
            console.log.apply(console, ['[TA.' + moduleName + ']', arguments]);
        }
    };

    /**
     * mouse helper
     */
    base.mouse = {
        x: 0,
        y: 0,
        rx: 0,
        ry: 0,
        speed: 45,
        delta: 0,
        time: 0,
        setXY: function (e) {
            if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
                //noinspection JSUnresolvedVariable
                var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                this.x = touch.pageX;
                this.y = touch.pageY;
            }
            else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
                this.x = e.pageX;
                this.y = e.pageY;
            }
        },
        setDelta: function () {
            var time = new Date().getTime();
            if (this.time) {
                this.delta = (time - this.time) / 1000;
            }
            this.time = time;
        },
        update: function () {
            this.setDelta();
            if (isNaN(this.delta) || this.delta <= 0) {
                return;
            }
            var distX = this.x - (this.rx), distY = this.y - (this.ry);
            if (distX !== 0 && distY !== 0) {
                this.rx -= ((this.rx - this.x) / this.speed);
                this.ry -= ((this.ry - this.y) / this.speed);
            }
        }
    };

    /**
     * tween helper
     */
    base.tween = {
        stack: [],
        to: function (obj, incr, props, callback) {
            incr = incr || 0.1;
            if (!$.isFunction(callback)) {
                callback = function () {
                }
            }
            var animation = function () {
                $.each(props, function (prop) {
                    if (obj[prop] >= this) {
                        delete props[prop];
                        return;
                    }
                    obj[prop] += incr;
                    if (obj[prop] > this) {
                        obj[prop] = this;
                    }
                });
                if ($.isEmptyObject(props)) {
                    base.tween.remove(animation);
                    callback(obj);
                }
            };
            this.add(animation);
        },
        add: function (fn) {
            base.trace('tween.add', this.stack.length);
            this.stack.push(fn);
        },
        remove: function (fn) {
            var pos = this.stack.indexOf(fn);
            base.trace('tween.remove', pos);
            if (pos != -1) {
                this.stack.splice(pos, 1);
            }
        },
        update: function () {
            for (var i = this.stack.length - 1; i >= 0; i--) {
                this.stack[i]();
            }
        }
    };

    /**
     * @param opts
     */
    base.init = function (opts) {
        if (this.renderer) {
            return;
        }
        this.opts = $.extend(this.opts, opts);
        this.container = $(this.opts.container || document.body);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
        this.renderer.view.webkitImageSmoothingEnabled = false;
        this.container.append(this.renderer.view);
        this.stage = new PIXI.Container();
        this.loader = PIXI.loader;
        this.bindEvents();
        this.animate();
        this.resize();
        base.trace('init', this);
        return this;
    };

    /**
     * @param url
     * @returns {base}
     */
    base.initStats = function (url) {
        if (this.debug) {
            $.getScript(url, function () {
                base.stats = new Stats();
                base.stats.setMode(0);
                base.container.append(base.stats.domElement);
            });
        }
        return this;
    };

    /**
     * @return void
     */
    base.bindEvents = function () {
        $(document).on('mousemove.' + moduleName + ' touchstart.' + moduleName + ' touchmove.' + moduleName, function (e) {
            base.mouse.setXY(e);
            base.mouse.x -= base.renderer.width / 2;
            base.mouse.y -= base.renderer.height / 2;
        });
        $(window).on('resize', function () {
            base.resize();
        });
    };

    /**
     * @param data {object|array}
     * @return base
     */
    base.addAssets = function (data) {
        if (!$.isArray(data)) {
            data = [data];
        }
        this.assets = this.assets.concat(data);
        return this;
    };

    /**
     * @return void
     */
    base.resize = function () {
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        var ratio = winWidth / this.width;
        var width = Math.ceil(this.width * ratio);
        var height = Math.ceil(this.height * ratio);
        var topOffset = height - winHeight;
        var maxTopOffset = height * this.opts.topOffsetRate;
        if (height > winHeight) {
            if (topOffset >= maxTopOffset) {
                topOffset = maxTopOffset;
                height -= topOffset;
            }
            else {
                height = winHeight;
            }
            this.stage.position.y = topOffset * -1;
        }
        else {
            this.stage.position.y = 0;
        }
        this.renderer.resize(width, height);
        this.stage.scale.set(ratio, ratio);

        base.trace(width + 'x' + height, winWidth + 'x' + winHeight, ratio);
    };

    /**
     * @param callback {function}
     * @return void
     */
    base.preload = function (callback) {
        if (!this.assets.length) {
            throw 'Please add assets.';
        }
        base.trace('preload assets', this.assets);
        // first load background asset
        this.loader.add(base.assets[0]).load(function (loader, res) {

            var bg = new PIXI.Sprite(res.background.texture);
            base.stage.addChild(bg);

            // base.tween.add(function(){
            // bg.x = base.mouse.rx/20;
            // bg.y = base.mouse.ry/-20;
            // bg.scale.x = 1.1;
            // bg.scale.y = 1.1;
            // });

            // create black/white background
            var grayFilter = new PIXI.filters.GrayFilter();
            var grayStage = new PIXI.Container();
            grayStage.addChild(new PIXI.Sprite(res.background.texture));
            grayStage.filters = [grayFilter];
            grayStage.filterArea = new PIXI.Rectangle(0, 0, base.stage.width, base.stage.height);
            base.stage.addChild(grayStage);

            // create preloader text object
            var preloader = new PIXI.Text('0%', base.opts.preloaderTextStyle);
            preloader.x = base.width - 100;
            preloader.y = base.height - 100;
            base.stage.addChild(preloader);

            // loading state object
            var loading = {
                progress: -1,
                value: 0,
                speed: base.opts.preloaderSpeed,
                update: function () {
                    if (loading.value >= loading.progress) {
                        return;
                    }
                    loading.value += loading.speed;
                    preloader.text = Math.ceil(loading.value) + '%';
                    grayStage.filterArea.height = base.stage.height - ((base.stage.height / 100) * loading.value);
                    if (loading.value >= 100) {
                        base.trace('tween.loading.complete');
                        base.stage.removeChild(grayStage);
                        // base.stage.removeChild(preloader);
                        preloader.text = '100%';
                        base.tween.remove(loading.update);
                    }
                }
            };
            base.tween.add(loading.update);

            // load other assets
            loader.reset();
            loader
                .add(base.assets)
                .on('progress', function (e) {
                    loading.progress = e.progress;
                    loading.speed = (e.progress / 100) * 3;
                    base.trace('assets.loading.progress', e.progress, e);
                })
                .once('complete', function (e) {
                    loading.progress = 100;
                    base.trace('assets.loading.complete', e);
                    callback();
                })
                .load()
            ;
        });
    };

    /**
     * @return void
     */
    base.run = function () {
        base.preload(function () {
            var dust = base.createDust();
            var tesla = base.createTesla();
            var magic = base.createMagicParticles();
            dust.alpha = tesla.alpha = magic.alpha = 0.0001;
            tesla.state.addAnimationByName(0, 'animation', true);

            base.tween.to(tesla, base.opts.teslaAlphaSpeed, {alpha: 1}, function () {
                setTimeout(function () {
                    base.tween.to(dust, base.opts.dustAlphaSpeed, {alpha: 1});
                    base.tween.to(magic, base.opts.magicAlphaSpeed, {alpha: 1});
                });
            }, 2000);
        });
    };

    /**
     * @return void
     */
    base.animate = function () {
        if (!this.renderer) {
            throw 'Please initialize.';
        }
        this.stats && this.stats.begin();
        this.renderer.render(this.stage);
        this.mouse.update();
        this.tween.update();
        this.stats && this.stats.end();
        requestAnimationFrame(function () {
            base.animate();
        });
    };

    /**
     * @returns {PIXI.spine.Spine}
     */
    base.createTesla = function () {
        /** @namespace base.loader.resources.tesla */
        var obj = new PIXI.spine.Spine(base.loader.resources.tesla.spineData);
        base.stage.addChild(obj);
        base.trace('initialize.tesla', obj);
        return obj;
    };

    /**
     * @returns {Particles}
     */
    base.createDust = function () {
        var obj = new base.Particles(base.opts.dust);
        base.stage.addChild(obj);
        base.tween.add(function () {
            obj.update();
        });
        base.trace('initialize.dust', obj);
        return obj;
    };

    /**
     * @returns {Particles}
     */
    base.createMagicParticles = function () {
        var obj = new base.Particles(base.opts.magic);
        base.stage.addChild(obj);
        base.tween.add(function () {
            obj.update();
        });
        base.trace('initialize.magic', obj);
        return obj;
    };

    /**
     * @param opts
     * @constructor
     */
    base.Particles = function (opts) {

        opts = $.extend({
            count: 50,
            properties: {
                alpha: true,
                scale: true
            },
            minSize: 1,
            maxSize: 7,
            minSpeed: 0.05,
            maxSpeed: 0.09,
            minAlpha: 1,
            maxAlpha: 1,
            minScaleSpeed: 0,
            maxScaleSpeed: 0,
            minAlphaSpeed: 0,
            maxAlphaSpeed: 0,
            minRotationSpeed: 0,
            maxRotationSpeed: 0,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            mouseReact: 0,
            spriteFunction: null
        }, opts);

        //noinspection JSUnresolvedFunction
        PIXI.ParticleContainer.call(this, opts.count, opts.properties);

        // create particles
        this.create = function () {
            //noinspection JSUnresolvedVariable
            for (var i = this._size - 1; i >= 0; i--) {
                this.makeParticle();
            }
        };

        this.update = function () {
            //noinspection JSUnresolvedVariable
            for (var i = this.children.length - 1; i >= 0; i--) {
                //noinspection JSUnresolvedVariable
                this.children[i].updateParticle();
            }
            if (opts.mouseReact) {
                this.x = base.mouse.rx / opts.mouseReact;
                this.y = base.mouse.ry / opts.mouseReact;
            }
        };

        this.makeParticle = function () {
            var particle = opts.spriteFunction();

            // particle.tint = 0xffffff * 255;
            // particle.blendMode = PIXI.blendModes.ADD

            // bounds
            var x1 = opts.x;
            var y1 = opts.y;
            var x2 = opts.x + opts.width;
            var y2 = opts.y + opts.height;

            // Set the x and y position
            particle.x = TA.utils.randomInt(x1, x2);
            particle.y = TA.utils.randomInt(y1, y2);

            particle.direction = {
                x: -1 + Math.random() * 2,
                y: -1 + Math.random() * 2
            };

            // Display a random frame if the particle has more than 1 frame
            if (particle.totalFrames > 0) {
                particle.gotoAndStop(TA.utils.randomInt(0, particle.totalFrames - 1));
            }

            // Set a random width and height
            var size = TA.utils.randomInt(opts.minSize, opts.maxSize);
            particle.width = size;
            particle.height = size;

            //Set the particle's `anchor` to its center
            particle.anchor.set(0.5, 0.5);

            // Set a random velocity at which the particle should move
            var speed = TA.utils.randomFloat(opts.minSpeed, opts.maxSpeed);
            particle.vx = speed * size;
            particle.vy = speed * size;

            // Set a random speed to change the scale, alpha and rotation
            particle.scaleSpeed = TA.utils.randomFloat(opts.minScaleSpeed, opts.maxScaleSpeed);
            particle.alphaSpeed = TA.utils.randomFloat(opts.minAlphaSpeed, opts.maxAlphaSpeed);
            particle.rotationSpeed = TA.utils.randomFloat(opts.minRotationSpeed, opts.maxRotationSpeed);

            // Add the particle to its parent container
            //noinspection JSUnresolvedFunction
            this.addChild(particle);

            var scale = 0;
            var alpha = TA.utils.randomFloat(opts.minAlpha, opts.maxAlpha);

            // The particle's `updateParticle` method is called on each frame of the
            particle.updateParticle = function () {
                // Move the particle
                this.x += this.vx * this.direction.x;
                this.y += this.vy * this.direction.y;

                // Change the particle's `rotation`
                this.rotation += this.rotationSpeed;

                // Change the particle's `alpha`
                if (this.alphaSpeed > 0) {
                    this.alpha = Math.abs(Math.sin(alpha += this.alphaSpeed));
                    if (this.alpha > opts.maxAlpha) {
                        this.alpha = opts.maxAlpha;
                    }
                    if (this.alpha < opts.minAlpha) {
                        this.alpha = opts.minAlpha;
                    }
                }

                // Change the particle's `scale`
                if (this.scaleSpeed > 0) {
                    this.scale.x = this.scale.y = Math.abs(Math.sin(scale += this.scaleSpeed));
                }

                this.boundaryCheck();

            };

            particle.changeDirection = function (axis) {
                this.direction[axis] *= -1;
            };

            particle.boundaryCheck = function () {
                if (this.x <= x1) {
                    this.x = x1;
                    this.changeDirection("x");
                }
                else if (this.x >= x2) {
                    this.x = x2;
                    this.changeDirection("x");
                }
                if (this.y <= y1) {
                    this.y = y1;
                    this.changeDirection("y");
                }
                else if (this.y >= y2) {
                    this.y = y2;
                    this.changeDirection("y");
                }
            }
        };

        this.create();
    };
    base.Particles.prototype = Object.create(PIXI.ParticleContainer.prototype);
    base.Particles.prototype.constructor = base.Particles;

    TA[moduleName] = base;

})(jQuery);
